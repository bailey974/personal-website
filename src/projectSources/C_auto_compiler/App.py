import os
import subprocess
from colorama import Fore, Style
from Printer import *

os.system("cls")

class AutoCompiler:
    
    def __init__(self) -> None:
        self.error_text = Fore.RED + "ERROR: "

    def CompileProject(self, project_path) -> None:
        
        if project_path == None:
            print("Please set a target c project path using the command \"set_dir\" ")
            return

        #Checking if folder is empty
        if self.is_folder_empty(project_path):
            print("Folder doesnt contain a src, include, or lib folder")
            return

        #Checking for src path
        if not self.folder_has_folder("src", project_path):
            print( self.error_text + "Folder doesnt contain a src file")
            return

        #Checking for lib path
        if not self.folder_has_folder("lib",  project_path):
            print(self.error_text + "Folder doesnt contain a lib file")
            return

        #Checking for include path
        if not self.folder_has_folder("include",  project_path):
            print(self.error_text + "Folder doesnt contain include folder")
            return
        
        #Wether the include folder is empty
        include_path = project_path + "/include"
        lib_path = project_path + "/lib"
        src_path = project_path + "/src"
        
        #Defualt command thing
        command = "gcc"

        #Notify user building as began
        print("Building compiling command....")

        #Scan src path for .c files
        if self.is_file_type_in_path(src_path, ".c"):
            print("Scanning src for .C files....")
            command += " src/*.c"
        else:
            print("No .C files found in src path")
            return

        #Scan lib path for .dll files
        if self.is_file_type_in_path(lib_path, ".dll"):
            print("Scanning lib for .dll files....")
            command += " lib/*.dll"
            
            #Scan include path for .h files
        if self.is_file_type_in_path(include_path, ".h"):
            print("Scanning include for .h files")
            command += " -Include/*.h"

        subprocess.Popen(command, cwd=project_path)
        
        print("Built and compiled!")

    def is_folder_empty(self, folder_path):
        return len(os.listdir(folder_path)) == 0

    def folder_has_file(self, folder, file_name):
        return file_name in os.listdir(folder)
    
    def folder_has_folder(self, folder_name, folder):
        return os.path.isdir(folder + "/" + folder_name)

    def is_file_type_in_path(self, folder, file_tag) -> bool:
        for file in os.listdir(folder):
            if file.endswith(file_tag):
                return True 
        return False

print(Fore.GREEN + "Welcome To CAutoCompiler, type the command help if your new! \n")
print(Fore.WHITE)

target_path = ""
compiler = AutoCompiler()

while True:

    i = input("\n")
    

    match i:
        case "compile":
            compiler.CompileProject(target_path)
        case "set_project":
            new_path = input("\n Enter new project directory: ")

            if os.path.exists(new_path):
                os.chdir(new_path)
                target_path = new_path
                ColorPrint("Project set :)", Fore.WHITE)
            else:
                ColorPrint("ERROR: Directory \"" + new_path + "\" not found", Fore.RED)
            
        case "help":
            ColorPrint("Heres a list of commands to get started: \n", Fore.GREEN )
            ColorPrint("\t compile : Compiles project, make sure you set the target directory ", Fore.BLUE) 
            ColorPrint("\t set_project : Allows you to change the target c project/directory", Fore.BLUE)
            ColorPrint("\t clear : Clears all past commands and errors", Fore.BLUE)
            print(Fore.WHITE)
        case "clear":
            os.system("cls")
            print(Fore.GREEN + "Welcome To CAutoCompiler, type the command help if your new! \n")
            print(Fore.WHITE)
        case _:
            print("\nCommand \"" + i + "\" not found" )
