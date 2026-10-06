/* Bailey Scanlan, 23316363 - operating systems project 1
 ca216/customshell */


#include <ctype.h>
#include <stdio.h>
#include <string.h>
#include "customshell.h"

/*
 * trim_whitespace - Trims leading and trailing whitespace from a string.
 * @str: The input string to be trimmed.
 *
 * Returns a pointer to the trimmed string.
 */
char *trim_whitespace(char *str) {
    char *end;
    // Trim leading space
    while (*str && isspace((unsigned char)*str))
        str++;
    if (*str == '\0')  // All spaces?
        return str;
    // Trim trailing space
    end = str + strlen(str) - 1;
    while (end > str && isspace((unsigned char)*end))
        end--;
    // Write new null terminator
    *(end + 1) = '\0';
    return str;
}

/*
 * print_error - Prints an error message to stderr in a consistent format.
 * @message: The error message to be printed.
 */
void print_error(const char *message) {
    fprintf(stderr, "Error: %s\n", message);
}
