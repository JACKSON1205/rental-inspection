# Lubuntu VM Setup

### Step 1: Download Requirements
1. Download and Install Virtual Box from: https://www.virtualbox.org/wiki/Downloads<br>
  - If you have Hyper-V, I recommend installing a previous build of VBox (I am using 6.1.26), or uninstall Hyper-V from Microsoft Services.<br>
2. Download Lubuntu Virtual Machine from: https://rebrand.ly/o1fy80n<br>
  - **THIS IS THE VM THEY WILL BE USING, DON'T GO INSTALLING SOME OTHER VERSION**<br>
3. Unzip the downloaded archive<br>

### Step 2.1: Quick VM Installation
1. Start Virtual Box -> Tools -> Import<br>
2. Keep Local File System<br>
3. Browse to the unzipped files and choose the file ending with .ovf<br>
4. Click Continue, keep default settings, and click Import<br>
5. When finished, Click on Start<br>
6. Wait to boot<br>
7. username: lubuntu<br>
8. password: lubuntu<br>

### Step 2.2: Alternate VM Installation (Only if 2.1 doesn't work)
1. Start Virtual Box<br>
2. Click on New<br>
3. Name: Enter a name for your virtual machine<br>
4. Machine Folder: Keep the default<br>
5. Type: Linux<br>
6. Version: Linux 2.6/3.x/4.x (64-bit)<br>
7. Click on Next<br>
8. Choose 2-4GB RAM<br>
9. Click on Next<br>
10. Choose: Use an existing virtual hard disk file<br>
11. Copy the 3 unzipped files to: `~/\<USER\>/VirtualBox VMs/\<VM FOLDER THAT YOU CREATED\>`<br>
12. Go back to VBox<br>
13. Click on the yellow foler on the right<br>
14. Click on Add<br>
15. Navigate to the folder containing the files you copied to: `~/\<USERNAME\>/VirtualBox VMs/\<VM FOLDER THAT YOU CREATED\>`<br>
16. Choose lubuntu_20.04.1_VM_LinuxVMImages-disk1<br>
17. Click on Create<br>
18. When finished, Click on Start<br>
19. Wait to boot<br>
20. username: lubuntu<br>
21. password: lubuntu<br>

### Step 3: Resolution
**If you skip this step, you won't be able to see the full terminal.**<br>
1. Click on the start menu (bottom left)<br>
2. Type monitor<br>
3. Click on Monitor Settings<br>
4. Choose a larger resolution<br>

### Step 3.1: Guest Additions
**For fullscreen, Only applicable with Step 2.2 or if you enable optical drive**<br>
1. Start QTerminal (Ctrl + Alt + T)<br>
2. run: `sudo apt install linux-headers-$(uname -r) build-essential dkms`<br>
3. Power off<br>
4. Start VM again (Ignore errors and wait)<br>
5. From top bar: Click on Devices -> Insert Guest Additions CD image...<br>
6. Start QTerminal (Ctrl + Alt + T)<br>
7. run: `cd /media/lubuntu/VBox_GAs_6.1.26` (replace with you version)<br>
8. run: `sudo ./VBoxLinuxAdditions.run`<br>
9. Press Right Ctrl + F for changes to take effect (if not on windows, press capture key for your host OS)<br>

### Step 5: Synchronize PMS
1. Generate ssh key: `ssh-keygen`<br>
2. Do not type anything just hit enter everytime<br>
3. Copy the key from `/home/lubuntu/.ssh/id_rsa.pub`<br>
4. Paste the key in your github account<br>
5. Clone the repo as usual inside vm<br>

### Step 6: Install PMS
1. cd to repo<br>
2. run: `chmod u+x install`<br>
3. run: `./install`<br>

## Important Notice:
- **DO NOT update the system when prompted because they will be using the default version.**<br>
