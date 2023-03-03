# This is the Linux Version of RunSmoothy.exe 

**Only Use On Linux Follow the directions for the windows version for windows users**

First thing is you will need to install the latest Nodejs LTS via nodesource
```
    sudo apt-get install curl
```
```
    curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
```
```
    sudo apt-get install -y nodejs
```
You can take a look at [Nodesource GitHub](https://github.com/nodesource/distributions#deb) to get the specific url for whichever version is LTS

After you install Nodejs you will need to install the npm dependecies inside via 
```
        npm i
```
Next you will need to add your bot token inside main.js(140)
```
        }); 
    client.login(''); 
```
Before proceeding to complile the run program check if Smoothy will run in the first place. Inside Smoothys' folder type the following in the terminal
```
    node .
```
If all is well you can proceed onto compiling, if not you can create an issue at [Smoothys' Repo](https://github.com/y0Phoenix/Smoothy) or try copy and pasting your problem into google, its most like a small one.

In order to compile c# on your linux machine you will need to install mono via
```
    sudo apt-get update
```

```
    sudo apt-get mono-complete
```

After that you will need to change these lines of code in the Program.cs file
```
    static string rundirectory = "/home/<Your>/<Smoothy>/<Directory>/";
```
Make sure you keep the errorlog.txt file in the same directory as the Program

Next you will need to run the following command in order to make run.sh executable.
```
    sudo chmod +x run.sh
```
Also Make sure you move the run.sh file into Smoothys' root Directory otherwise Smoothy will never run. 

Finally you can compile and run the new program via the following
```
    sudo mcs Program.cs
```
```
    sudo mono Program.exe
```

You can create an issue on [Smoothys' repo](https://github.com/y0Phoenix/Smoothy) on GitHub with any proplems with compiling or any exception errors. 
