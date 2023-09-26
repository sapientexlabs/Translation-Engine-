import os
import moviepy.editor as mp
import speech_recognition as sr
from pydub import AudioSegment
from pydub.silence import split_on_silence
from deep_translator import GoogleTranslator

# required: imageMagick

def run(videofile, audio_output, audio_chunks_location, target_language, outputfile):
    audio_extracted = video_to_audio(videofile, audio_output)
    text = audio_to_text(audio_output, audio_chunks_location)
    translated_text = text_to_translated_text(text, target_language)
    process_complete = text_to_cc(translated_text, videofile, outputfile)


def video_to_audio(videofile, audiofile):
    video = mp.VideoFileClip(videofile)
    video.audio.write_audiofile(audiofile, codec='pcm_s16le')
    print("video to audio complete")
    return True


def audio_to_text(audiofile, chunkdir):
    r = sr.Recognizer()
    sound = AudioSegment.from_wav(audiofile)
    chunks = split_on_silence(sound,
                              min_silence_len=500,
                              silence_thresh=sound.dBFS - 14,
                              keep_silence=True,
                              )
    if not os.path.isdir(chunkdir):
        os.mkdir(chunkdir)
    res = []
    rolling_timecode = 0
    for i, audio_chunk in enumerate(chunks, start=1):
        chunk_filename = os.path.join(chunkdir, f"chunk{i}.wav")
        audio_chunk.export(chunk_filename, format="wav")
        with sr.AudioFile(chunk_filename) as source:
            audio_listened = r.record(source)
            try:
                text = r.recognize_google(audio_listened)
            except sr.UnknownValueError as e:
                print("Error:", str(e))
            else:
                text = f"{text.capitalize()}. "
                elem = {'id': i, 'tc_start': "%.2f" % rolling_timecode, 'duration': "%.2f" % source.DURATION,
                        'text': text}
                rolling_timecode += source.DURATION
                res.append(elem)
    print("audio to text complete")
    return res


def text_to_translated_text(text, target_language):
    res = []
    for item in text:
        translated_text = GoogleTranslator(source='english', target=target_language).translate(item['text'])
        res.append(
            {'id': item['id'], 'tc_start': item['tc_start'], 'duration': item['duration'], 'text': translated_text})
    print("translation complete")
    return res


def text_to_cc(text, videofile, newfile):
    subs = []
    video = mp.VideoFileClip(videofile)
    screensize = (video.w, video.h)
    for item in text:
        txtclip = mp.TextClip(item['text'],
                              font='Arial',
                              color='white',
                              kerning=0,
                              size=screensize,
                              method='caption')
        txtclip = txtclip.set_pos('center', 'bottom').set_duration(item['duration'])
        subs.append(txtclip)
    subtitles = mp.concatenate_videoclips(subs)
    result = mp.CompositeVideoClip([video, subtitles.set_pos(('center', 'bottom'))])
    result.write_videofile(newfile, fps=video.fps, temp_audiofile="temp_audio.m4a", remove_temp=True,
                           codec="libx264", audio_codec="aac")
    return True


run(os.path.join("media", "feynman_sample.mp4"),
    os.path.join("media", "feynman_sample.wav"),
    os.path.join("media", "chunks"),
    "spanish",
    os.path.join("media", "final.mp4"))

# text_to_cc_alt([{'translated_text': 'Test test test', 'tc_start': 0, 'duration': 5}], os.path.join("media",
# "feynman_sample.mp4"), "blub.mp4")
