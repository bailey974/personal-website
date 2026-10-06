/* Bailey Scanlan, 23316363 - operating systems project 1
 ca216/customshell */

 #include <stdio.h>
 #include <stdlib.h>
 #include <string.h>
 #include <unistd.h>   // For gethostname() and chdir()/getcwd() on Unix
 #include <sys/types.h>
 #include <sys/stat.h>
 #include <errno.h>
 #ifdef _WIN32
   #include <direct.h>  // For _chdir(), _getcwd() on Windows
   #include <windows.h>
   #include <process.h> // For _spawnvp()
   #ifndef PATH_MAX
   #define PATH_MAX _MAX_PATH
   #endif
 #else
   #define CHANGE_DIR chdir
   #define GET_CWD getcwd
 #endif
 
 #ifdef _WIN32
   #define CHANGE_DIR _chdir
   #define GET_CWD _getcwd
 #endif
 
 // Maximum length of an input line and maximum number of tokens per line.
 #define MAX_LINE_LENGTH 1024
 #define MAX_TOKENS 64
 
 /*
  * set_shell_env - Sets the "shell" environment variable to the given path.
  * @path: The path to set as the shell environment variable.
  */
 static void set_shell_env(const char *path) {
 #ifdef _WIN32
     _putenv_s("shell", path);
 #else
     setenv("shell", path, 1);
 #endif
 }
 
 /*
  * shell_clr - Clears the terminal screen.
  */
 static void shell_clr(void) {
 #ifdef _WIN32
     system("cls");
 #else
     system("clear");
 #endif
 }
 
 /*
  * shell_cd - Changes the current working directory.
  * If no argument is provided, prints the current directory.
  * @args: Array of command arguments.
  * @argCount: Number of arguments.
  */
 static void shell_cd(char **args, int argCount) {
     // If no directory is specified, print the current directory
     if (argCount < 2) {
         char buffer[PATH_MAX];
         if (GET_CWD(buffer, sizeof(buffer))) {
             printf("%s\n", buffer);
         } else {
             perror("getcwd");
         }
         return;
     }
     // Attempt to change to the specified directory
     if (CHANGE_DIR(args[1]) != 0) {
         fprintf(stderr, "cd: %s: %s\n", args[1], strerror(errno));
         return;
     }
 
     // Update the PWD environment variable with the new current directory
     char buffer[PATH_MAX];
     if (GET_CWD(buffer, sizeof(buffer))) {
 #ifdef _WIN32
         _putenv_s("PWD", buffer);
 #else
         setenv("PWD", buffer, 1);
 #endif
     }
 }
 
 /*
  * shell_dir - Lists the contents of a directory.
  * If no directory is specified, defaults to the current directory.
  * @args: Array of command arguments.
  * @argCount: Number of arguments.
  */
 static void shell_dir(char **args, int argCount) {
     // Use current directory if no argument is given
     const char *directory = (argCount < 2) ? "." : args[1];
 #ifdef _WIN32
     char cmd[PATH_MAX + 10];
     // Construct the command to list directory contents on Windows
     snprintf(cmd, sizeof(cmd), "dir %s", directory);
     system(cmd);
 #else
     char cmd[PATH_MAX + 20];
     // Construct the command to list directory contents on Unix-like systems
     snprintf(cmd, sizeof(cmd), "ls -al '%s'", directory);
     system(cmd);
 #endif
 }
 
 #ifndef _WIN32
 // For Unix-like systems, use the environ variable.
 extern char **environ;
 /*
  * shell_environ - Prints all the environment variables.
  */
 static void shell_environ(void) {
     if (environ == NULL) return;
     for (char **env = environ; *env != NULL; env++) {
         printf("%s\n", *env);
     }
 }
 #else
/*
 * shell_environ - Prints all the environment variables.
 * On Windows we assume _environ is provided by the runtime.
 */
 static void shell_environ(void) {
    if (_environ == NULL) return;
    for (char **env = _environ; *env != NULL; env++) {
        printf("%s\n", *env);
    }
}

 #endif
 
 /*
  * shell_echo - Prints the provided text to the standard output.
  * @args: Array of command arguments.
  * @argCount: Number of arguments.
  */
 static void shell_echo(char **args, int argCount) {
     // Start from index 1 to skip the command name ("echo")
     for (int i = 1; i < argCount; i++) {
         printf("%s", args[i]);
         if (i < argCount - 1)
             printf(" ");
     }
     printf("\n");
 }
 
 /*
  * shell_help - Displays the help manual using the 'more' pager.
  *
  * This function sends the help text through the 'more' filter for paging.
  * If the pager cannot be opened, it falls back to printing directly.
  */
 static void shell_help(void) {
     const char *manual =
         "Custom Shell - Available Commands:\n\n"
         "cd <directory>   : Change directory (cd with no args prints current dir)\n"
         "clr              : Clear screen\n"
         "dir <directory>  : List directory contents\n"
         "environ          : List environment variables\n"
         "echo <text>      : Echo text\n"
         "help             : Show this help manual\n"
         "pause            : Pause until Enter is pressed\n"
         "quit             : Exit the shell\n\n"
         "I/O Redirection:\n"
         "  command < input.txt    : Redirect input\n"
         "  command > output.txt   : Redirect output (overwrite)\n"
         "  command >> output.txt  : Redirect output (append)\n\n"
         "Background Processing:\n"
         "  command &              : Run command in background\n\n"
         "If a batch file is provided (e.g., ./customshell <batchfile>),\n"
         "commands are read from that file until EOF.\n";
 
     // Attempt to open a pipe to the 'more' command for paging the help output
     FILE *pager = popen("more", "w");
     if (pager == NULL) {
         fprintf(stderr, "Failed to open pager. Printing help directly.\n");
         printf("%s\n", manual);
         return;
     }
     // Send the help text to the pager
     fputs(manual, pager);
     pclose(pager);
 }
 
 /*
  * shell_pause - Pauses the shell until the user presses Enter.
  */
 static void shell_pause(void) {
     printf("Press Enter to continue...\n");
     char dummy[2];
     fgets(dummy, sizeof(dummy), stdin);
 }
 
 /*
  * shell_quit - Exits the shell.
  */
 static void shell_quit(void) {
     exit(EXIT_SUCCESS);
 }
 
 /*
  * handle_internal_command - Checks if the command is a built-in shell command.
  * If it is, executes it and returns 1; otherwise, returns 0.
  *
  * @args: Array of command arguments.
  * @argCount: Number of arguments.
  *
  * Returns:
  *   1 if the command was handled as an internal command, 0 otherwise.
  */
 static int handle_internal_command(char **args, int argCount) {
     if (argCount == 0)
         return 1;
 
     if (strcmp(args[0], "cd") == 0) {
         shell_cd(args, argCount);
         return 1;
     } else if (strcmp(args[0], "clr") == 0) {
         shell_clr();
         return 1;
     } else if (strcmp(args[0], "dir") == 0) {
         shell_dir(args, argCount);
         return 1;
     } else if (strcmp(args[0], "environ") == 0) {
         shell_environ();
         return 1;
     } else if (strcmp(args[0], "echo") == 0) {
         shell_echo(args, argCount);
         return 1;
     } else if (strcmp(args[0], "help") == 0) {
         shell_help();
         return 1;
     } else if (strcmp(args[0], "pause") == 0) {
         shell_pause();
         return 1;
     } else if (strcmp(args[0], "quit") == 0) {
         shell_quit();
     }
     // If command is not built-in, return 0 so it can be executed as an external command
     return 0;
 }
 
 /*
  * tokenize_line - Splits a line of input into tokens separated by whitespace.
  * @line: The input line.
  * @args: Array to store the tokens.
  *
  * Returns the number of tokens.
  */
 static int tokenize_line(char *line, char **args) {
     int count = 0;
     // Use strtok to split the line by spaces, tabs, carriage returns, and newlines
     char *token = strtok(line, " \t\r\n");
     while (token != NULL && count < MAX_TOKENS - 1) {
         args[count++] = token;
         token = strtok(NULL, " \t\r\n");
     }
     args[count] = NULL; 
     return count;
 }
 
 #ifdef _WIN32
 /*
  * run_external_command (Windows version) - Executes an external command.
  * Supports background processing (using "&") but I/O redirection is not implemented.
  * @args: Array of command arguments.
  */
 static void run_external_command(char **args) {
     int background = 0;
     char *input_file = NULL;
     char *output_file = NULL;
     int append_output = 0;
 
     char *new_args[MAX_TOKENS];
     int new_arg_count = 0;
 
     for (int i = 0; args[i] != NULL; i++) {
         if (strcmp(args[i], "<") == 0) {
             if (args[i+1] != NULL) {
                 input_file = args[i+1];
                 i++;
             } else {
                 fprintf(stderr, "Error: no input file specified.\n");
                 return;
             }
         } else if (strcmp(args[i], ">") == 0) {
             if (args[i+1] != NULL) {
                 output_file = args[i+1];
                 append_output = 0;
                 i++;
             } else {
                 fprintf(stderr, "Error: no output file specified.\n");
                 return;
             }
         } else if (strcmp(args[i], ">>") == 0) {
             if (args[i+1] != NULL) {
                 output_file = args[i+1];
                 append_output = 1;
                 i++;
             } else {
                 fprintf(stderr, "Error: no output file specified.\n");
                 return;
             }
         } else if (strcmp(args[i], "&") == 0) {
             background = 1;
         } else {
             new_args[new_arg_count++] = args[i];
         }
     }
     new_args[new_arg_count] = NULL;
 
     if (input_file != NULL || output_file != NULL) {
         fprintf(stderr, "I/O redirection not implemented on Windows in this example.\n");
     }
     if (background) {
         // Run command in background (_P_NOWAIT does not wait for process completion)
         int ret = _spawnvp(_P_NOWAIT, new_args[0], (const char * const *)new_args);
         if (ret == -1) {
             fprintf(stderr, "Error executing command '%s'\n", new_args[0]);
         } else {
             printf("Process %d running in background.\n", ret);
         }
     } else {
         int ret = _spawnvp(_P_WAIT, new_args[0], (const char * const *)new_args);
         if (ret == -1) {
             fprintf(stderr, "Error executing command '%s'\n", new_args[0]);
         }
     }
 }
 #else
 /*
  * run_external_command (Unix-like version) - Executes an external command.
  * Supports I/O redirection (<, >, >>) and background processing (with "&").
  * @args: Array of command arguments.
  */
 static void run_external_command(char **args) {
     int background = 0;
     char *input_file = NULL;
     char *output_file = NULL;
     int append_output = 0;
 
     // Build a new arguments array without redirection tokens and the "&" symbol.
     char *new_args[MAX_TOKENS];
     int new_arg_count = 0;
     for (int i = 0; args[i] != NULL; i++) {
         if (strcmp(args[i], "<") == 0) {
             if (args[i+1] != NULL) {
                 input_file = args[i+1];
                 i++; // Skip filename token.
             } else {
                 fprintf(stderr, "Error: no input file specified.\n");
                 return;
             }
         } else if (strcmp(args[i], ">") == 0) {
             if (args[i+1] != NULL) {
                 output_file = args[i+1];
                 append_output = 0;
                 i++;
             } else {
                 fprintf(stderr, "Error: no output file specified.\n");
                 return;
             }
         } else if (strcmp(args[i], ">>") == 0) {
             if (args[i+1] != NULL) {
                 output_file = args[i+1];
                 append_output = 1;
                 i++;
             } else {
                 fprintf(stderr, "Error: no output file specified.\n");
                 return;
             }
         } else if (strcmp(args[i], "&") == 0) {
             background = 1;
         } else {
             new_args[new_arg_count++] = args[i];
         }
     }
     new_args[new_arg_count] = NULL;
 
     pid_t pid = fork();
     if (pid == 0) {
         // Child process: set up I/O redirection if needed.
         if (input_file != NULL) {
             FILE *in = fopen(input_file, "r");
             if (!in) {
                 fprintf(stderr, "Error opening input file '%s'\n", input_file);
                 exit(EXIT_FAILURE);
             }
             int in_fd = fileno(in);
             dup2(in_fd, STDIN_FILENO);
             fclose(in);
         }
         if (output_file != NULL) {
             FILE *out;
             if (append_output)
                 out = fopen(output_file, "a");
             else
                 out = fopen(output_file, "w");
             if (!out) {
                 fprintf(stderr, "Error opening output file '%s'\n", output_file);
                 exit(EXIT_FAILURE);
             }
             int out_fd = fileno(out);
             dup2(out_fd, STDOUT_FILENO);
             fclose(out);
         }
         execvp(new_args[0], new_args);
         fprintf(stderr, "Error executing command '%s': %s\n", new_args[0], strerror(errno));
         exit(EXIT_FAILURE);
     } else if (pid < 0) {
         perror("fork");
     } else {
         // Parent process: wait for child if not background.
         if (!background) {
             int status;
             waitpid(pid, &status, 0);
         } else {
             printf("Process %d running in background.\n", pid);
         }
     }
 }
 #endif
 
 /*
  * process_line - Processes a single line of input.
  *
  * Tokenizes the input line, checks if it's an internal command, and either executes
  * the internal command or passes it to be executed as an external command.
  *
  * @line: The input line.
  */
 static void process_line(char *line) {
     char *args[MAX_TOKENS];
     int argCount = tokenize_line(line, args);
     if (argCount == 0)
         return; 
 
     // If not internal cmd, execute as an external command
     if (!handle_internal_command(args, argCount)) {
         run_external_command(args);
     }
 }
 
 /*
  * interactive_mode - Runs the shell in interactive mode.
  *
  * Continuously prompts the user for input, processes each input line, and displays the prompt.
  */
 // Helper function to get the computer (host) name.
static void get_computer_name(char *buffer, size_t size) {
    #ifdef _WIN32
        DWORD size_dw = (DWORD)size;
        if (!GetComputerName(buffer, &size_dw)) {
            strncpy(buffer, "Unknown", size);
            buffer[size - 1] = '\0';
        }
    #else
        if (gethostname(buffer, size) != 0) {
            strncpy(buffer, "Unknown", size);
            buffer[size - 1] = '\0';
        }
    #endif
    }
 static void interactive_mode(void) {
    char line[MAX_LINE_LENGTH];
    char cwd[PATH_MAX];
    char compname[256]; // Buffer for computer name.
    for (;;) {
        // Get the computer name.
        get_computer_name(compname, sizeof(compname));
        // Get the current working directory.
        if (GET_CWD(cwd, sizeof(cwd))) {
            // Extract the basename of the current working directory.
            char *base = strrchr(cwd, '/');
#ifdef _WIN32
            if (!base)
                base = strrchr(cwd, '\\');
#endif
            if (base)
                base++; // Skip the delimiter.
            else
                base = cwd;
            // Print prompt as: <computer name> <current dir basename> >
            printf("%s %s > ", compname, base);
        } else {
            perror("getcwd");
            printf("%s > ", compname);
        }
        fflush(stdout);

        // Read a line of input.
        if (!fgets(line, sizeof(line), stdin)) {
            printf("\nExiting shell.\n");
            break;
        }
        process_line(line);
    }
}
 
 /*
  * main - The entry point of the shell.
  *
  * If a batch file is provided as a command-line argument, the shell processes commands
  * from that file; otherwise, it runs in interactive mode.
  *
  * @argc: Argument count.
  * @argv: Argument vector.
  *
  * Returns 0 on successful execution.
  */
 int main(int argc, char *argv[]) {
     // Set the shell environment variable to the path of the executable
     set_shell_env(argv[0]);
 
     // If a batch file is specified, read and execute commands from it
     if (argc > 1) {
         FILE *fp = fopen(argv[1], "r");
         if (!fp) {
             fprintf(stderr, "Error: Failed to open batch file '%s': %s\n", argv[1], strerror(errno));
             return 1;
         }
         char line[MAX_LINE_LENGTH];
         // Process each line in the batch file
         while (fgets(line, sizeof(line), fp)) {
             process_line(line);
         }
         fclose(fp);
         return 0;
     }
 
     // Otherwise, enter interactive mode
     interactive_mode();
     return 0;
 }
 