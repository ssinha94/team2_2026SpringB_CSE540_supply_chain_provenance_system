import os
from tkinter import *
from tkinter import ttk
import subprocess


def submit():
    asset_id = asset_id_entry.get()
    doc_hash = doc_hash_entry.get()
    subprocess.run(["node", "registerAsset.js", asset_id, doc_hash])
    asset_window.destroy()

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
            b.pack_forget()

#create a new asset
def makeAsset():
    # opens a new small window
    asset_window = Toplevel(root)
    asset_window.title("New Asset")
    asset_window.geometry("300x200")

    # input fields
    ttk.Label(asset_window, text="Asset ID:").pack(pady=5)
    asset_id_entry = ttk.Entry(asset_window, width=30)
    asset_id_entry.pack()

    ttk.Label(asset_window, text="Document Hash:").pack(pady=5)
    doc_hash_entry = ttk.Entry(asset_window, width=30)
    doc_hash_entry.pack()

    def submit():
        asset_id = asset_id_entry.get()
        doc_hash = doc_hash_entry.get()

        print(f"Registering asset: {asset_id} with hash: {doc_hash}")
        asset_window.destroy()

    ttk.Button(asset_window, text="Register", command=submit).pack(pady=10)
    print("Asset made")


#moves asset owner
def moveAsset():
    asset_window = Toplevel(root)
    asset_window.title("Transfer Asset")
    asset_window.geometry("300x250")

    ttk.Label(asset_window, text="Asset ID:").pack(pady=5)
    asset_id_entry = ttk.Entry(asset_window, width=30)
    asset_id_entry.pack()

    ttk.Label(asset_window, text="New Owner:").pack(pady=5)
    new_owner_entry = ttk.Entry(asset_window, width=30)
    new_owner_entry.pack()

    result_label = ttk.Label(asset_window, text="")
    result_label.pack(pady=5)

    def submit():
        asset_id = asset_id_entry.get()
        new_owner = new_owner_entry.get()
        result = subprocess.run(
            ["node", "transferAsset.js", asset_id, new_owner],
            capture_output=True, text=True
        )
        result_label.config(text=result.stdout)

    ttk.Button(asset_window, text="Transfer", command=submit).pack(pady=10)
    print("Asset moved")

#displays asset information
def checkAsset():
    asset_window = Toplevel(root)
    asset_window.title("Check Asset")
    asset_window.geometry("300x300")

    # input to search by ID
    ttk.Label(asset_window, text="Asset ID:").pack(pady=5)
    asset_id_entry = ttk.Entry(asset_window, width=30)
    asset_id_entry.pack()

    # results will show up here
    result_text = ttk.Label(asset_window, text="")
    result_text.pack(pady=10)

    def submit():
        asset_id = asset_id_entry.get()
        result = subprocess.run(
            ["node", "queryAsset.js", asset_id],
            capture_output=True, text=True
        )
        result_text.config(text=result.stdout)

    ttk.Button(asset_window, text="Search", command=submit).pack()
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