/* Bailey Scanlan, 23316363 - Operating Systems Project 1
   ca216/customshell */

   #ifndef CUSTOMSHELL_H
   #define CUSTOMSHELL_H
   
   #include <stdio.h>
   #include <stdlib.h>
   #include <string.h>
   #include <errno.h>
   
   #ifdef _WIN32
     #include <direct.h>
     #include <windows.h>
     #include <process.h>
   #else
     #include <unistd.h>
     #include <sys/types.h>
     #include <sys/wait.h>
     #include <fcntl.h>  // For file I/O redirection
   #endif
   
   #define MAX_LINE_LENGTH 1024
   #define MAX_TOKENS 64
   
   /* ----- Internal command function prototypes ----- */
   void shell_cd(char **args, int argCount);
   void shell_clr(void);
   void shell_dir(char **args, int argCount);
   void shell_environ(void);
   void shell_echo(char **args, int argCount);
   void shell_help(void);
   void shell_pause(void);
   void shell_quit(void);
   
   /* ----- Shell operation and parsing ----- */
   int tokenize_line(char *line, char **args);
   void process_line(char *line);
   void interactive_mode(void);
   void batch_mode(const char *filename);  // Stage 1 batch mode support
   
   /* ----- Stage 2: External execution, redirection, background ----- */
   
   /* Execute external commands using fork & exec */
   void execute_external(char **args, int argCount, int background);
   
   /* Check for and handle I/O redirection (<, >, >>) */
   void handle_redirection(char **args, int *inputRedirect, int *outputRedirect, int *appendRedirect, char **inputFile, char **outputFile);
   
   /* Utility: Detect if command should run in background (& at end) */
   int is_background_command(char **args);
   
   #endif /* CUSTOMSHELL_H */