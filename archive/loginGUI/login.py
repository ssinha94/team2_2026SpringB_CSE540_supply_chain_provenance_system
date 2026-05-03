import os
import sys
from tkinter import *
from tkinter import ttk

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from db.manager import verify_user

def check_input():
    username = entry.get()
    password = password_entry.get()
    role = verify_user(username, password)
    
    if role:
        result_label.config(text=f"Welcome, {username}!", foreground="green")
        login_frame.pack_forget() 
        logout_button.pack(pady=10)
        render_dashboard(role)
    else:
        result_label.config(text="Invalid credentials.", foreground="red")

def render_dashboard(role):
    if role in ['superuser', 'manufacturer']:
        new_Asset_btn.pack(pady=5)
    if role in ['superuser', 'manufacturer', 'distributor', 'retailer', 'auditor']:
        query_Asset_btn.pack(pady=5)
    if role in ['superuser', 'manufacturer', 'distributor']:
        transfer_Asset_btn.pack(pady=5)

def hide_dashboard_btns():
    new_Asset_btn.pack_forget()
    transfer_Asset_btn.pack_forget()
    query_Asset_btn.pack_forget()

def show_registration_form():
    hide_dashboard_btns()
    registration_frame.pack(pady=20)

def show_query_form():
    hide_dashboard_btns()
    query_frame.pack(pady=20)

def show_transfer_form():
    hide_dashboard_btns()
    transfer_frame.pack(pady=20)

def back_to_dashboard():
    registration_frame.pack_forget()
    query_frame.pack_forget()
    transfer_frame.pack_forget()
    username = entry.get()
    role = 'manufacturer' if username == 'ssinha94' else 'superuser'
    render_dashboard(role)

def logout():
    hide_dashboard_btns()
    logout_button.pack_forget()
    registration_frame.pack_forget()
    query_frame.pack_forget()
    transfer_frame.pack_forget()
    result_label.config(text="Logged out.", foreground="blue")
    entry.delete(0, END)
    password_entry.delete(0, END)
    login_frame.pack(pady=20)

root = Tk()
root.title('Supply Chain Provenance System')
root.geometry('400x600')

login_frame = Frame(root)
login_frame.pack(pady=20)
ttk.Label(login_frame, text="Username").pack()
entry = ttk.Entry(login_frame, width=30)
entry.pack(pady=5)
ttk.Label(login_frame, text="Password").pack()
password_entry = ttk.Entry(login_frame, width=30, show="*") 
password_entry.pack(pady=5)
ttk.Button(login_frame, text='Login', command=check_input).pack(pady=10)

result_label = ttk.Label(root, text="")
result_label.pack()

registration_frame = Frame(root)
ttk.Label(registration_frame, text="Asset ID").pack(pady=5)
asset_id_reg = ttk.Entry(registration_frame, width=30)
asset_id_reg.pack(pady=5)
ttk.Label(registration_frame, text="Document Metadata").pack(pady=5)
metadata_reg = ttk.Entry(registration_frame, width=30)
metadata_reg.pack(pady=5)
ttk.Button(registration_frame, text='Submit', command=back_to_dashboard).pack(pady=10)

query_frame = Frame(root)
ttk.Label(query_frame, text="Asset ID").pack(pady=5)
query_id_entry = ttk.Entry(query_frame, width=30)
query_id_entry.pack(pady=5)
ttk.Button(query_frame, text='Query Asset', command=lambda: print(f"Querying {query_id_entry.get()}")).pack(pady=5)
ttk.Button(query_frame, text='Cancel', command=back_to_dashboard).pack()

transfer_frame = Frame(root)
ttk.Label(transfer_frame, text="Asset ID").pack(pady=5)
transfer_id_entry = ttk.Entry(transfer_frame, width=30)
transfer_id_entry.pack(pady=5)

ttk.Button(transfer_frame, text='Execute Transfer', command=lambda: print(f"Transferring {transfer_id_entry.get()}")).pack(pady=5)
ttk.Button(transfer_frame, text='Cancel', command=back_to_dashboard).pack()

new_Asset_btn = ttk.Button(root, text='Register New Asset', command=show_registration_form)
query_Asset_btn = ttk.Button(root, text='Query Asset Detail', command=show_query_form)
transfer_Asset_btn = ttk.Button(root, text='Transfer Custody', command=show_transfer_form)
logout_button = ttk.Button(root, text='Logout', command=logout)

root.mainloop()