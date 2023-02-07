const EMAIL_LIST = "EmailList";

function fillGroups() {
  // Get list of all the existing groups in the list to be added.
  const allGroups = getExistingGroupsList_();

  // For each group:
  // Delete the existing group
  // Create the group fresh
  // Add the group back to the members@sierramasterchorale.org list
  // Add in all the member names


  allGroups.forEach(groupKey => {
    const group = generateGroup_(groupKey);
    // Easiest to just delete the group in order to remove
    // all the members. This also removes the group from 
    // members@sierramasterchorale.org, so we have to add that back
    // once we're done.
    deleteGroup_(group);
    createGroup_(group);
    addGroupMember(group.email, "members@sierramasterchorale.org");
  })

  const members = getNewMemberList_();
  members.forEach(member => {
    // member is a 2-column array: email address, group email address
    addGroupMember(member[0], member[1]);
  });
}

/**
* Delete an existing group.
* @param {group}   group (including name and email properties)
*/
function deleteGroup_(group) {
  try {
    AdminDirectory.Groups.remove(group.email);
    Logger.log(`Group ${group.email} was deleted.`);
  }
  catch (err) {
    Logger.log(`${err}: ${group.email}`);
  }
}

function generateGroup_(groupName) {
  // Generate a group object.
  // You can pass in either the short name ("tenors")
  // or the full name ("tenors@sierramasterchorale.org")
  // Either way, you end up with an appropriately configured group object.

  let groupKey = groupName;
  const pos = groupName.indexOf("@");
  if(pos === -1) {
    // @ not found
    groupKey = groupName + "@sierramasterchorale.org";
  }
  else {
    // @ was found, so strip the first part
    groupName = groupName.substring(0, pos);
  }
  const group = {};
  group.name = groupName;
  group.email = groupKey;
  return group;
}

function createGroup_(group) {
  // Given a name, create a group. Allow members outside the organization.
  try {
    AdminDirectory.Groups.insert(group);
    Logger.log(`Group ${group.email} was created.`);
  }
  catch (err) {
    Logger.log(`${err}: ${group.email}`);
  }

}

function getExistingGroupsList_() {
  // Return an array of all existing email groups.
  let ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(EMAIL_LIST);
  let values = sheet.getRange(2, 3, sheet.getLastRow() - 1, 1).getValues();
  values = values.map(value => value[0]);
  // Get a unique set of emails.
  const unique = Array.from(new Set(values));
  return unique;
}

function getNewMemberList_() {
  let ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(EMAIL_LIST);
  let values = sheet.getRange(2, 2, sheet.getLastRow() - 1, 2).getValues();
  Logger.log(values);
  return values;
}

/**
* Retrieve a list of all members of a group.
* @param {string}   groupEmail 
* @return {string}  List of all group members
*
*/
function getGroupMemberList_(groupEmail) {
  let list = AdminDirectory.Members.list(groupEmail);
  let members = list.members;
  let rows = [];
  if (members) {
    rows = members.map(member => member.email);
  }
  return (rows);
}

/**
* Add a new member to a group.
* @param {string}   userEmail 
* @param {string}   groupEmail
* @return {boolean}    success
*
*/
function addGroupMember(userEmail, groupEmail) {
  var member = {
    email: userEmail,
    role: "MEMBER"
  };
  try {
    AdminDirectory.Members.insert(member, groupEmail);
    Logger.log("User %s added as a member of group %s.", userEmail, groupEmail);
    return true;
  }
  catch (err) {
    Logger.log(`${userEmail} is already a member of ${groupEmail}.`);
    return false;
  }
}

function deleteGroupMember(userEmail, groupEmail) {
  try {
    AdminDirectory.Members.remove(groupEmail, userEmail);
    Logger.log("User %s deleted as a member of group %s.", userEmail, groupEmail);
    return true;
  }
  catch (err) {
    Logger.log(`${userEmail} is not a member of ${groupEmail}.`);
    return false;
  }
}
