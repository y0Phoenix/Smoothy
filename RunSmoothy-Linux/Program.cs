using System;
using System.Diagnostics;
using System.Timers;
using System.Configuration;
using System.Linq;
using System.Text;
using System.IO;
using System.Threading.Tasks;

namespace Run_Smoothy
{
    class Program
    {
        private static System.Timers.Timer aTimer;
        static ProcessStartInfo procstartinfo;
        static Process process = null;
        static string rundirectory = "/home/aaron/Documents/Smoothy/";
        static string filename = "./run.sh";
        static string logfilename = "errorlog.txt";
        static StreamWriter log;

        public static void Main()
        {
            SetTimer();

            procstartinfo = new ProcessStartInfo();
            procstartinfo.FileName = filename;
            procstartinfo.UseShellExecute = false;
            procstartinfo.RedirectStandardOutput = true;
            procstartinfo.RedirectStandardError = true;
            log = new StreamWriter(logfilename);

            var runningProcesses = Process.GetProcessesByName("node");
            if (runningProcesses.Length > 0)
            {
                WriteEntry("Smoothy is already running so killing it!");
                // try lambda expression
                foreach (var p in runningProcesses)
                {
                    p.Kill();
                }
            }

            Console.WriteLine("\nPress the Enter key to exit the application...\n");
            Console.WriteLine("The application started at {0:HH:mm:ss.fff}", DateTime.Now);
            Console.ReadLine();

            aTimer.Stop();
            aTimer.Dispose();

            Console.WriteLine("Terminating the application...");

            log.Close();
        }

        static void SetTimer()
        {
            // Create a timer with a two second interval.
            aTimer = new System.Timers.Timer(1000);
            // Hook up the Elapsed event for the timer. 
            aTimer.Elapsed += OnTimedEvent;
            aTimer.AutoReset = true;
            aTimer.Enabled = true;
        }

        static bool runningStatus = false;
        static int progress = -1;
        static string currunText = "Smoothy is currently running ";
        static int progressLen = 10;

        static void OnTimedEvent(Object source, ElapsedEventArgs e)
        {
            Process[] pname = Process.GetProcessesByName("node");
            runningStatus = pname.Length > 0;
            if (!runningStatus)
            {
                Directory.SetCurrentDirectory(rundirectory);
                WriteEntry("Not Running, Starting up Smoothy...");
                process = Process.Start(procstartinfo);
        
                StartTask(CaptureOutput, process.StandardOutput);
                StartTask(CaptureOutput, process.StandardError);

                progress = -1;
            }
            else if (progress == -1)
            {
                WriteLogFile(currunText);
                progress = 0;
            }
            else if (runningStatus && progress >= 0)
            {
                Console.Write(currunText + new string('.', progress++) + "\r");
                if (progress == progressLen)
                {
                    Console.Write(currunText + new string(' ', progress++) + "\r");
                    progress = 0;
                }
            }

        }

        static void CaptureOutput(StreamReader sr)
        {
            using (StreamReader reader = sr)
            {
                while (!reader.EndOfStream)
                {
                    string result = reader.ReadLine();
                    if (progress > -1)
                        Console.Write(new string(' ', currunText.Length + progressLen + 2) + "\r");
                    WriteEntry(result);
                    progress = -1;
                }
                progress = 0;
            }
        }

        static void StartTask(Action<StreamReader> callback, StreamReader sr)
        {
            Task.Factory.StartNew(() =>
            {
                CaptureOutput(sr);
            });
        }

        static void WriteEntry(string entry)
        {
            Console.WriteLine(entry);
            WriteLogFile(entry);
        }

        static void WriteLogFile(string entry)
        {
            entry = $"[{DateTime.Now:MM/dd/yyyy HH:mm:ss.fff}] " + entry;
            log.WriteLine(entry);
            log.Flush();
        }
    }
}

