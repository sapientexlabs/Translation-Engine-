import os
import unittest
from package.job_processor import job_processor
from package import untertitle_settings


class JobProcessorTestCase(unittest.TestCase):

    def test_path_generation_in_container(self):
        untertitle_settings.DEV = True
        jp = job_processor.JobProcessor(42)
        path = jp.path_to('test.file')
        self.assertEqual(path[-23:], os.path.join("_testfiles", "42", "test.file"))

    def test_millis_to_srt_timestamp_converter(self):
        untertitle_settings.DEV = True
        jp = job_processor.JobProcessor(1)
        millis = 234020
        expected_timestamp = "00:03:54,020"
        self.assertEqual(jp.milliseconds_to_srt_timestamp(millis), expected_timestamp)

if __name__ == '__main__':
    unittest.main()
