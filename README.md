# new-beg-mongodb
## Setup Instructions
Clone repository, then run "npm install". Place env and credentials file in root directory, then run "npm start".
## Run Instructions
Running the script now takes 2 command line arguments, npm start \<table_name\> \<command\>.  
**table_name**: Which spreadsheet to scrape. Possible values are employment, housing, food and clothing.  
**command**: Add or update. Add only checks for (and adds) new entries, and will not remove or update existing ones. Update deletes all the entries from the DB and reuploads them based on spreadsheet, effectively updating changed values including deletion (idk if there's a better way to do this).  
Default values are employment for table_name and add for command. So npm start does npm start employment add, and npm start housing does npm start housing add
