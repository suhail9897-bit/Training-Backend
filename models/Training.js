const mongoose = require('mongoose');

const trainingSchema = new mongoose.Schema({
  trainingId: { type: String, required: true, unique: true },
  trainingTitle: { type: String, required: true },  // Course title
  description: { type: String },
  category: { type: String },
  duration: { type: Number },  // duration in minutes
  startTime: { type: Date },
  endTime: { type: Date },
  videoPath: { type: String },       
  videoFilename: { type: String },
  chapters: [
    {
      name: String,
      description: String,
      duration: Number,
      dependentChapter: String,
      pdf: String, // ✅ uploaded PDF file path
      mandatory: { type: Boolean, default: false }, 

      indexes: [
        {
          _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
          name: String,
          pageNo: Number,
          subIndexes: [ // ✅ new added field for nested hierarchy
            {
              _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
              name: String,
              pageNo: Number,
              subIndexes: [ // ✅ support further nested inside sub topic
                {
                  _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
                  name: String,
                  pageNo: Number,
                  subIndexes: [ // ✅ support further nested inside sub topic
                    {
                      _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
                      name: String,
                      pageNo: Number
                      
                    }
                  ]
                  
                }
              ]
            }
          ]
        }
      ]
      
    }
  ]
});

module.exports = mongoose.model('Training', trainingSchema);
