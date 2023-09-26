import os
import time
from datetime import datetime
import moviepy.editor as mp
import speech_recognition as sr
from pydub import AudioSegment
from pydub.silence import split_on_silence
from deep_translator import GoogleTranslator
from enum import IntEnum
from ..db_connector import db_connector
from ..untertitle_utils import log
from .. import untertitle_settings

__all__ = ['JobProcessor']


class JobState(IntEnum):
    NO_STATE = 0,
    JOB_CREATED = 10,
    READY_FOR_PROCESSING = 20,
    PROCESSING = 30,
    EXTRACTING_AUDIO = 31,
    SPLITTING_AUDIO_INTO_SEGMENTS = 32,
    EXTRACTING_TEXT = 33,
    TRANSLATING_TEXT = 34,
    GENERATING_SRT = 35,
    EMBEDDING_SUBTITLES = 36,
    FINISHED = 40,
    ERROR = 50,
    DELETED = 60


class JobProcessor:

    def __init__(self, job_id):
        log("job processor initialised")
        self.job_id = job_id
        self.dbc = db_connector.DbConnector()
        self.source_file = None
        self.audio_file = None
        self.audio_chunks = None
        self.segments = None
        self.job_details = None
        self.path_to_ffmpeg = untertitle_settings.PATH_TO_FFMPEG if not untertitle_settings.DEV else untertitle_settings.DEV_PATH_TO_FFMPEG

    def run(self):
        log("triggered job processor for job", self.job_id)
        self.dbc.touch_job(self.job_id)
        self.job_details = self.dbc.get_job(self.job_id)[0]
        files = self.dbc.get_files_for_job(self.job_id)
        for file in files:
            if file['is_input_file'] == 1:
                self.source_file = file['filename']
                break
        if self.source_file:
            log('source file found in database, starting process')
            self.dbc.set_job_state(self.job_id, JobState.PROCESSING.value)
            self.audio_file = "untertitle_job_" + str(self.job_id) + "_out.wav"
            time.sleep(1)
            if not self.extract_audio(self.source_file, self.audio_file):
                return False
            time.sleep(1)
            self.segments = self.split_audio(self.audio_file)
            if not self.segments:
                return False
            time.sleep(1)
            self.segments = self.translate(self.segments,
                                           self.job_details['source_language_id'].lower(),
                                           self.job_details['target_language_id'].lower())
            if not self.segments:
                return False
            time.sleep(1)
            if not self.generate_srt(self.segments, "untertitle_job_" + str(self.job_id) + "_out.srt"):
                return False
            time.sleep(1)
            self.dbc.set_job_state(self.job_id, JobState.FINISHED.value)
            log("processing finished for job", self.job_id)
        return True

    def path_to(self, filename):
        base = "/untertitle-media/" if not untertitle_settings.DEV else untertitle_settings.DEV_PATH_TO_MEDIA
        return os.path.join(base, str(self.job_id), filename)

    def extract_audio(self, video_file_in, audio_file_out):
        self.dbc.set_job_state(self.job_id, JobState.EXTRACTING_AUDIO.value)
        log("trying to extract audio from", video_file_in)
        try:
            video = mp.VideoFileClip(self.path_to(video_file_in))
            video.audio.write_audiofile(self.path_to(audio_file_out), codec='pcm_s16le')
            self.dbc.insert_job_file(self.job_id, "Extracted Audio", audio_file_out)
            log("successfully extracted", audio_file_out)
            return True
        except Exception as e:
            log("exception in extract audio:", e)
            self.dbc.set_job_state(self.job_id, JobState.ERROR.value)
            return False

    def split_audio(self, audio_file_in):
        self.dbc.set_job_state(self.job_id, JobState.SPLITTING_AUDIO_INTO_SEGMENTS.value)
        log("trying to extract audio from", self.path_to(audio_file_in))
        try:
            chunks_folder = self.path_to("chunks")
            r = sr.Recognizer()
            AudioSegment.converter = self.path_to_ffmpeg
            sound = AudioSegment.from_wav(self.path_to(audio_file_in))
            chunks = split_on_silence(sound,
                                      min_silence_len=500,
                                      silence_thresh=sound.dBFS - 14,
                                      keep_silence=True,
                                      )
            if not os.path.isdir(chunks_folder):
                os.mkdir(chunks_folder)
            segments = []
            rolling_timecode = 0
            for i, audio_chunk in enumerate(chunks, start=1):
                chunk_filename = os.path.join(chunks_folder, f"chunk{i}.wav")
                audio_chunk.export(chunk_filename, format="wav")
                with sr.AudioFile(chunk_filename) as source:
                    audio_listened = r.record(source)
                    try:
                        text = r.recognize_google(audio_listened)
                    except sr.UnknownValueError as e:
                        print("Error:", str(e))
                    else:
                        text = f"{text.capitalize()}. "
                        elem = {'id': i, 'tc_start': "%.3f" % rolling_timecode, 'duration': "%.3f" % source.DURATION,
                                'text': text}
                        rolling_timecode += source.DURATION
                        segments.append(elem)
            print("audio to text complete")
            return segments
        except Exception as e:
            log("exception in split audio:", e)
            self.dbc.set_job_state(self.job_id, JobState.ERROR.value)
            return False

    def translate(self, segments, source_language, target_language):
        log("trying to translate caption. languages requested: ", source_language, target_language)
        self.dbc.set_job_state(self.job_id, JobState.TRANSLATING_TEXT.value)
        processed_segments = []
        seq = 1
        for segment in segments:
            try:
                processed_segment = segment.copy()
                log("translating segment", seq, len(segments))
                processed_segment['translated_caption'] = GoogleTranslator(source=source_language,
                                                                           target=target_language).translate(
                    segment['text'])
                self.dbc.add_segment_for_job(self.job_id,
                                             int(float(processed_segment['tc_start']) * float(1000)),
                                             int(float(processed_segment['duration']) * float(1000)),
                                             processed_segment['text'],
                                             processed_segment['translated_caption'])
                processed_segments.append(processed_segment)
                seq += 1
            except Exception as e:
                log("exception during translation:", e)
                self.dbc.set_job_state(self.job_id, JobState.ERROR.value)
                return False
        return processed_segments

    def generate_srt(self, segments, target_file):
        log("trying to generate srt file")
        self.dbc.set_job_state(self.job_id, JobState.GENERATING_SRT.value)
        try:
            seq = 1
            f = open(self.path_to(target_file), "a", encoding='utf-8')
            for segment in segments:
                f.write(str(seq) + "\n")
                seg_start = self.milliseconds_to_srt_timestamp(float(segment['tc_start']) * float(1000))
                seg_end = self.milliseconds_to_srt_timestamp(float(segment['tc_start']) * float(1000) + float(segment['duration']) * float(1000))
                f.write(seg_start + " --> " + seg_end + "\n")
                f.write(segment['translated_caption']+"\n")
                f.write("\n")
                seq += 1
            f.close()
            self.dbc.insert_job_file(self.job_id, "Translated SRT", target_file)
        except Exception as e:
            log("exception during generation of srt file:", e)
            self.dbc.set_job_state(self.job_id, JobState.ERROR.value)
            return False
        return True

    def milliseconds_to_srt_timestamp(self, millis):
        s = int((millis/1000) % 60)
        m = int((millis/(1000*60)) % 60)
        h = int((millis/(1000*60*60)) % 24)
        i = int(millis % 1000)
        return "%02i:%02i:%02i,%03i" % (h, m, s, i)




