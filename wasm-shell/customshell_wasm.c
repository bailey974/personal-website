/* Bailey Scanlan, 23316363 - operating systems project 1
 ca216/customshell

 WASM ADAPTATION NOTE:
 This file is a fork of Stage2/src/customshell.c (see src/projectSources/Shell
 for the real, unmodified source), adapted to compile with Emscripten and run
 client-side in the browser for bailey974.github.io. The changes are isolated
 behind `#ifdef __EMSCRIPTEN__` blocks:

   - shell_clr    : calls a JS bridge instead of system("clear") (no process
                    spawning is available in a single-threaded browser build)
   - shell_dir    : lists a directory directly via opendir/readdir against
                    Emscripten's in-memory filesystem, instead of
                    system("ls -al ...")
   - shell_help   : prints the manual directly (no popen("more") pager)
   - shell_pause  : prints a message instead of blocking on fgets(stdin),
                    since there's no OS-level blocking read in this build
   - run_external_command : fork()/execvp() don't exist in a browser sandbox,
                    so any command that isn't a shell builtin reports
                    "command not found" - exactly what a real shell does when
                    a binary isn't on PATH, since none of them are here
   - interactive_mode/main : replaced with three exported functions
                    (shell_init, shell_run_line, shell_get_prompt) that
                    JavaScript drives one line at a time, instead of a
                    blocking read loop over real stdin

 Everything else (tokenizing, built-in command dispatch, cd/echo/environ
 logic) is unchanged from the real project.
*/

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <sys/types.h>
#include <sys/stat.h>
#include <errno.h>
#include <limits.h>
#include <dirent.h>

#define CHANGE_DIR chdir
#define GET_CWD getcwd

#define MAX_LINE_LENGTH 1024
#define MAX_TOKENS 64

#ifndef PATH_MAX
#define PATH_MAX 4096
#endif

#ifdef __EMSCRIPTEN__
#include <emscripten.h>

EM_JS(void, wasm_clear_screen, (void), {
  if (typeof window !== 'undefined' && typeof window.__wasmShellClear === 'function') {
    window.__wasmShellClear();
  }
});
#endif

static void set_shell_env(const char *path) {
    setenv("shell", path, 1);
}

static void shell_clr(void) {
#ifdef __EMSCRIPTEN__
    wasm_clear_screen();
#else
    system("clear");
#endif
}

static void shell_cd(char **args, int argCount) {
    if (argCount < 2) {
        char buffer[PATH_MAX];
        if (GET_CWD(buffer, sizeof(buffer))) {
            printf("%s\n", buffer);
        } else {
            perror("getcwd");
        }
        return;
    }
    if (CHANGE_DIR(args[1]) != 0) {
        fprintf(stderr, "cd: %s: %s\n", args[1], strerror(errno));
        return;
    }
    char buffer[PATH_MAX];
    if (GET_CWD(buffer, sizeof(buffer))) {
        setenv("PWD", buffer, 1);
    }
}

static void shell_dir(char **args, int argCount) {
    const char *directory = (argCount < 2) ? "." : args[1];
#ifdef __EMSCRIPTEN__
    DIR *d = opendir(directory);
    if (!d) {
        fprintf(stderr, "dir: cannot access '%s': %s\n", directory, strerror(errno));
        return;
    }
    struct dirent *entry;
    while ((entry = readdir(d)) != NULL) {
        if (strcmp(entry->d_name, ".") == 0 || strcmp(entry->d_name, "..") == 0) continue;
        char full[PATH_MAX];
        snprintf(full, sizeof(full), "%s/%s", directory, entry->d_name);
        struct stat st;
        if (stat(full, &st) == 0) {
            printf("%s  %8ld  %s\n", S_ISDIR(st.st_mode) ? "d" : "-", (long)st.st_size, entry->d_name);
        } else {
            printf("?         %s\n", entry->d_name);
        }
    }
    closedir(d);
#else
    char cmd[PATH_MAX + 20];
    snprintf(cmd, sizeof(cmd), "ls -al '%s'", directory);
    system(cmd);
#endif
}

extern char **environ;
static void shell_environ(void) {
    if (environ == NULL) return;
    for (char **env = environ; *env != NULL; env++) {
        printf("%s\n", *env);
    }
}

static void shell_echo(char **args, int argCount) {
    for (int i = 1; i < argCount; i++) {
        printf("%s", args[i]);
        if (i < argCount - 1)
            printf(" ");
    }
    printf("\n");
}

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
        "Running in a WebAssembly build in your browser: there's no real OS\n"
        "underneath, so external commands (anything not in the list above)\n"
        "aren't available, matching what a real shell does when a binary\n"
        "isn't on PATH. I/O redirection and background jobs aren't\n"
        "supported in this build either.\n";
#ifdef __EMSCRIPTEN__
    printf("%s\n", manual);
#else
    FILE *pager = popen("more", "w");
    if (pager == NULL) {
        fprintf(stderr, "Failed to open pager. Printing help directly.\n");
        printf("%s\n", manual);
        return;
    }
    fputs(manual, pager);
    pclose(pager);
#endif
}

static void shell_pause(void) {
#ifdef __EMSCRIPTEN__
    printf("(pause has no effect in the browser build)\n");
#else
    printf("Press Enter to continue...\n");
    char dummy[2];
    fgets(dummy, sizeof(dummy), stdin);
#endif
}

static void shell_quit(void) {
#ifdef __EMSCRIPTEN__
    printf("(there's no process to exit in the browser build \xe2\x80\x94 just close the tab)\n");
#else
    exit(EXIT_SUCCESS);
#endif
}

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
        return 1;
    }
    return 0;
}

static int tokenize_line(char *line, char **args) {
    int count = 0;
    char *token = strtok(line, " \t\r\n");
    while (token != NULL && count < MAX_TOKENS - 1) {
        args[count++] = token;
        token = strtok(NULL, " \t\r\n");
    }
    args[count] = NULL;
    return count;
}

static void run_external_command(char **args) {
#ifdef __EMSCRIPTEN__
    fprintf(stderr, "%s: command not found\n", args[0]);
#else
    int background = 0;
    char *input_file = NULL;
    char *output_file = NULL;
    int append_output = 0;

    char *new_args[MAX_TOKENS];
    int new_arg_count = 0;
    for (int i = 0; args[i] != NULL; i++) {
        if (strcmp(args[i], "<") == 0) {
            if (args[i+1] != NULL) { input_file = args[i+1]; i++; }
            else { fprintf(stderr, "Error: no input file specified.\n"); return; }
        } else if (strcmp(args[i], ">") == 0) {
            if (args[i+1] != NULL) { output_file = args[i+1]; append_output = 0; i++; }
            else { fprintf(stderr, "Error: no output file specified.\n"); return; }
        } else if (strcmp(args[i], ">>") == 0) {
            if (args[i+1] != NULL) { output_file = args[i+1]; append_output = 1; i++; }
            else { fprintf(stderr, "Error: no output file specified.\n"); return; }
        } else if (strcmp(args[i], "&") == 0) {
            background = 1;
        } else {
            new_args[new_arg_count++] = args[i];
        }
    }
    new_args[new_arg_count] = NULL;

    pid_t pid = fork();
    if (pid == 0) {
        if (input_file != NULL) {
            FILE *in = fopen(input_file, "r");
            if (!in) { fprintf(stderr, "Error opening input file '%s'\n", input_file); exit(EXIT_FAILURE); }
            dup2(fileno(in), STDIN_FILENO);
            fclose(in);
        }
        if (output_file != NULL) {
            FILE *out = append_output ? fopen(output_file, "a") : fopen(output_file, "w");
            if (!out) { fprintf(stderr, "Error opening output file '%s'\n", output_file); exit(EXIT_FAILURE); }
            dup2(fileno(out), STDOUT_FILENO);
            fclose(out);
        }
        execvp(new_args[0], new_args);
        fprintf(stderr, "Error executing command '%s': %s\n", new_args[0], strerror(errno));
        exit(EXIT_FAILURE);
    } else if (pid < 0) {
        perror("fork");
    } else {
        if (!background) {
            int status;
            waitpid(pid, &status, 0);
        } else {
            printf("Process %d running in background.\n", pid);
        }
    }
#endif
}

static void process_line(char *line) {
    char *args[MAX_TOKENS];
    int argCount = tokenize_line(line, args);
    if (argCount == 0)
        return;

    if (!handle_internal_command(args, argCount)) {
        run_external_command(args);
    }
}

static void get_computer_name(char *buffer, size_t size) {
#ifdef __EMSCRIPTEN__
    strncpy(buffer, "wasm-shell", size);
    buffer[size - 1] = '\0';
#else
    if (gethostname(buffer, size) != 0) {
        strncpy(buffer, "Unknown", size);
        buffer[size - 1] = '\0';
    }
#endif
}

#ifdef __EMSCRIPTEN__

static char g_prompt_buf[512];

EMSCRIPTEN_KEEPALIVE
void shell_init(void) {
    set_shell_env("wasm-shell");

    mkdir("/home", 0777);
    mkdir("/home/guest", 0777);
    chdir("/home/guest");

    FILE *f = fopen("/home/guest/README.md", "w");
    if (f) {
        fputs(
            "# customshell (compiled to WebAssembly)\n\n"
            "This is the real Stage2 customshell.c, compiled with Emscripten\n"
            "and running client-side in your browser - not a scripted\n"
            "animation. Type 'help' for available commands.\n",
            f
        );
        fclose(f);
    }
    mkdir("/home/guest/Projects", 0777);
}

EMSCRIPTEN_KEEPALIVE
void shell_run_line(const char *line) {
    char buf[MAX_LINE_LENGTH];
    strncpy(buf, line, sizeof(buf) - 1);
    buf[sizeof(buf) - 1] = '\0';
    process_line(buf);
}

EMSCRIPTEN_KEEPALIVE
const char *shell_get_prompt(void) {
    char cwd[PATH_MAX];
    char compname[256];
    get_computer_name(compname, sizeof(compname));
    if (GET_CWD(cwd, sizeof(cwd))) {
        char *base = strrchr(cwd, '/');
        base = base ? base + 1 : cwd;
        snprintf(g_prompt_buf, sizeof(g_prompt_buf), "%s %s > ", compname, base);
    } else {
        snprintf(g_prompt_buf, sizeof(g_prompt_buf), "%s > ", compname);
    }
    return g_prompt_buf;
}

int main(void) {
    return 0;
}

#else

static void interactive_mode(void) {
    char line[MAX_LINE_LENGTH];
    char cwd[PATH_MAX];
    char compname[256];
    for (;;) {
        get_computer_name(compname, sizeof(compname));
        if (GET_CWD(cwd, sizeof(cwd))) {
            char *base = strrchr(cwd, '/');
            if (base) base++; else base = cwd;
            printf("%s %s > ", compname, base);
        } else {
            perror("getcwd");
            printf("%s > ", compname);
        }
        fflush(stdout);
        if (!fgets(line, sizeof(line), stdin)) {
            printf("\nExiting shell.\n");
            break;
        }
        process_line(line);
    }
}

int main(int argc, char *argv[]) {
    set_shell_env(argv[0]);
    if (argc > 1) {
        FILE *fp = fopen(argv[1], "r");
        if (!fp) {
            fprintf(stderr, "Error: Failed to open batch file '%s': %s\n", argv[1], strerror(errno));
            return 1;
        }
        char line[MAX_LINE_LENGTH];
        while (fgets(line, sizeof(line), fp)) {
            process_line(line);
        }
        fclose(fp);
        return 0;
    }
    interactive_mode();
    return 0;
}

#endif
