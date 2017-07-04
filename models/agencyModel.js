const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const agencySchema = new Schema(
  // 1st arg -> fields of the documents of this collection
  {
    // All users
    nameAgency: { type: String },
    
    //***  is better to use email as username 
    //***  than username + name + email , is too confusing  */
    email:           {type:String},
    contactPhone:    {type:String},
    address:         {type:String},
    country:         {type:String},
    usersWithThisAgency: [{ type: Schema.Types.ObjectId }],
    // Traditional registration users
    //username: { type: String },
    //encryptedPassword: { type: String },
  },

  // 2nd arg -> additional options
  {
    // Adds createdAt & updatedAt to documents
    timestamps: true
  }
);

const agency = mongoose.model('Agency', agencySchema);


module.exports = agency;