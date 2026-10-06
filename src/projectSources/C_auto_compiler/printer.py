from colorama import Fore

def ColorPrint(text, color = Fore.WHITE):
    print("\n" + color + text)

def GetColoredText(text, color = Fore.WHITE):
    return color + text