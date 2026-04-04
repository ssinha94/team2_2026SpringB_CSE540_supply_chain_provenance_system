import os
from tkinter import *
from tkinter import ttk

def check_input():
    dir = os.path.dirname(__file__)
    with open(os.path.join(dir, "roles.txt")) as f:
        roles = [line.strip().split(", ") for line in f]

    match = next((line for line in roles if entry.get() == line[0]), None)
    
    if any(entry.get() == line[0] for line in roles):
        role = match[1]
        result_label.config(text="User found")
        fullGUI(True, role)
    else:
        result_label.config(text="User not found")
        fullGUI(False)

def fullGUI(showGUI, role = None):
    
    if showGUI:
        role_label.config(text = role.upper())

        if role == "manufacturer":
            new_Asset.pack()
            move_Asset.pack_forget()
            check_Asset.pack_forget()
        elif role == "distributor":
            new_Asset.pack_forget()
            move_Asset.pack()
            check_Asset.pack()
        elif role == "retailer":
            new_Asset.pack_forget()
            move_Asset.pack_forget()
            check_Asset.pack()
        elif role == "auditor":
            new_Asset.pack()
            move_Asset.pack()
            check_Asset.pack()
        
    else:
        role_label.config(text = "")
        for b in buttons:
            b.forget()

#creates an asset
def makeAsset():
    print("Asset made")

#moves asset owner
def moveAsset():
    print("Asset moved")

#displays asset information
def checkAsset():
    print("Asset checked")


root = Tk()
root.geometry('300x500')
root.resizable(False, False)
root.title('Group 2 demo')

#name input for login
entry = ttk.Entry(root, width=30)
entry.pack(pady=10)

submit_button = ttk.Button(root, text='Submit', command=check_input)
submit_button.pack()

result_label = ttk.Label(root, text="")
result_label.pack()
role_label = ttk.Label(root, text="")
role_label.pack()


#Function buttons
new_Asset = ttk.Button(root, text='New Asset', command=makeAsset)

move_Asset = ttk.Button(root, text='Move Asset', command=moveAsset)

check_Asset = ttk.Button(root, text='Check Asset', command=checkAsset)

buttons = [new_Asset, move_Asset, check_Asset]


# exit button
exit_button = ttk.Button(
    root,
    text='Exit',
    command=lambda: root.quit()
)

exit_button.pack(
    ipadx=5,
    ipady=5,
    side=BOTTOM,
    expand=True
)

root.mainloop()