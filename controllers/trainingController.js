const Training = require('../models/Training');
const mongoose = require('mongoose');

const fs = require('fs');
const path = require('path');

// Add new training
exports.addTraining = async (req, res) => {
  try {
    const {
      trainingId, trainingTitle, description, category,
      duration, startTime, endTime
    } = req.body;

    let videoPath = '';
    let videoFilename = '';

    if (req.file) {
      videoPath = '/uploads/videos/' + req.file.filename;
      videoFilename = req.file.originalname;
    }

    const newTraining = new Training({
      trainingId,
      trainingTitle,
      description,
      category,
      duration,
      startTime,
      endTime,
      videoPath,
      videoFilename
    });

    await newTraining.save();

    res.status(201).json({
      message: 'Training added successfully',
      training: newTraining
    });
  } catch (error) {
    res.status(500).json({ message: 'Error adding training', error: error.message });
  }
};

//training list 
// Get all trainings
exports.getAllTrainings = async (req, res) => {
    try {
      const trainings = await Training.find();
      res.status(200).json(trainings);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching trainings', error: error.message });
    }
  };

  

// Delete a training by ID
exports.deleteTraining = async (req, res) => {
  try {
    const { id } = req.params;

    const training = await Training.findById(id);
    if (!training) {
      return res.status(404).json({ message: 'Training not found' });
    }

    // ✅ Delete video file if exists
    if (training.videoPath) {
      const oldVideoPath = path.join(__dirname, '..', training.videoPath);
      if (fs.existsSync(oldVideoPath)) {
        fs.unlinkSync(oldVideoPath);
        console.log('Deleted video file:', oldVideoPath);
      }
    }

    // ✅ Finally, delete training from DB
    await Training.findByIdAndDelete(id);

    res.status(200).json({ message: 'Training and associated video deleted successfully' });
  } catch (error) {
    console.error('Error deleting training:', error);
    res.status(500).json({ message: 'Error deleting training', error: error.message });
  }
};
  

  // Update a training by ID
  exports.updateTraining = async (req, res) => {
    try {
      const { id } = req.params;
  
      const existingTraining = await Training.findById(id);
      if (!existingTraining) {
        return res.status(404).json({ message: 'Training not found' });
      }
  
      let videoPath = existingTraining.videoPath;
      let videoFilename = existingTraining.videoFilename;
  
      // ✅ Only delete old video if a valid new file is uploaded
      if (req.file && req.file.filename) {
        // Safely delete old video file
        if (existingTraining.videoPath) {
          const oldVideoPath = path.join(__dirname, '..', existingTraining.videoPath);
          if (fs.existsSync(oldVideoPath)) {
            fs.unlinkSync(oldVideoPath);
            console.log('✅ Deleted old video file:', oldVideoPath);
          }
        }
  
        // Set new video info
        videoPath = '/uploads/videos/' + req.file.filename;
        videoFilename = req.file.originalname;
      }
  
     // Proceed to update training
     const updatedTraining = await Training.findByIdAndUpdate(
      id,
      {
        ...req.body,
        videoPath,
        videoFilename,
      },
      { new: true }
    );

    res.status(200).json(updatedTraining);
  } catch (error) {
    console.error('Error in updateTraining:', error);
    res.status(500).json({ message: 'Error updating training', error: error.message });
  }
};

// ✅ Add new chapter controller
exports.addChapter = async (req, res) => {
    try {
      const { name, description, duration,  } = req.body; 
      const training = await Training.findById(req.params.id);
      if (!training) return res.status(404).json({ message: 'Training not found' });
  
      const newChapter = {
        name,
        description,
        duration,
        pdf: 'pdfs/' + req.file.filename, 
        
      };
  
      training.chapters.push(newChapter);
      await training.save();

      const lastChapter = training.chapters[training.chapters.length - 1];   //testing
  
      res.status(200).json({ message: 'Chapter added', chapter: lastChapter });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };
  

  //chapter list by training id 
  exports.getChapters = async (req, res) => {
    try {
      const training = await Training.findById(req.params.id);
      if (!training) return res.status(404).json({ message: 'Training not found' });
  
      res.status(200).json({ chapters: training.chapters });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };


  // ✅ Update chapter text fields
exports.updateChapter = async (req, res) => {
  try {
    const { trainingId, chapterId } = req.params;
    const { name, description, duration, } = req.body;

    const training = await Training.findById(trainingId);
    if (!training) return res.status(404).json({ message: 'Training not found' });

    const chapter = training.chapters.id(chapterId);
    if (!chapter) return res.status(404).json({ message: 'Chapter not found' });

    chapter.name = name || chapter.name;
    chapter.description = description || chapter.description;
    chapter.duration = duration || chapter.duration;
   

    await training.save();

    res.status(200).json({ message: 'Chapter updated successfully', chapter });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error updating chapter', error: err.message });
  }
};

// ✅ Replace chapter PDF
exports.replaceChapterPdf = async (req, res) => {
  try {
    const { trainingId, chapterId } = req.params;

    const training = await Training.findById(trainingId);
    if (!training) return res.status(404).json({ message: 'Training not found' });

    const chapter = training.chapters.id(chapterId);
    if (!chapter) return res.status(404).json({ message: 'Chapter not found' });

    // 🗑️ Delete old file
    if (chapter.pdf) {
      const oldFilePath = path.join(__dirname, '../uploads', chapter.pdf);
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }
    }

    // ✅ Save new file name
    chapter.pdf = 'pdfs/' + req.file.filename;


    await training.save();

    res.status(200).json({ message: 'Chapter PDF replaced successfully', chapter });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error replacing PDF', error: err.message });
  }
};


// ✅ Delete chapter controller
exports.deleteChapter = async (req, res) => {
  try {
    const { trainingId, chapterId } = req.params;

    const training = await Training.findById(trainingId);
    if (!training) return res.status(404).json({ message: 'Training not found' });

    const chapter = training.chapters.id(chapterId);
    if (!chapter) return res.status(404).json({ message: 'Chapter not found' });

    // ✅ Delete PDF from uploads folder
    if (chapter.pdf) {
      const fullPath = path.join(__dirname, '../uploads', chapter.pdf);
      console.log('Deleting file at:', fullPath);  // debug line
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      } else {
        console.warn('File not found at:', fullPath);
      }
    }
    

    // ✅ Remove chapter from array
    training.chapters = training.chapters.filter((c) => c._id.toString() !== chapterId);

    await training.save();

    res.status(200).json({ message: 'Chapter deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error deleting chapter', error: err.message });
  }
};


// Add new index inside a chapter
exports.addIndex = async (req, res) => {
  try {
    const { trainingId, chapterId } = req.params;
    const { name, pageNo } = req.body;

    const training = await Training.findById(trainingId);
    if (!training) return res.status(404).json({ message: 'Training not found' });

    const chapter = training.chapters.id(chapterId);
    if (!chapter) return res.status(404).json({ message: 'Chapter not found' });

    if (req.body.videoEndTime <= req.body.videoStartTime) {
      return res.status(400).json({ message: 'Video end time must be greater than start time' });
  }
  

    const newIndex = { _id: new mongoose.Types.ObjectId(), name, pageNo,
      videoStartTime: req.body.videoStartTime || 0,   // NEW
  videoEndTime: req.body.videoEndTime || 0,       // NEW
  
     };
    chapter.indexes.push(newIndex);

    await training.save();
    res.status(200).json({ message: 'Index added successfully', index: newIndex });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error adding index', error: err.message });
  }
};

//edit index controller
exports.updateIndex = async (req, res) => {
  try {
    const { trainingId, chapterId, indexId } = req.params;
    const { name, pageNo } = req.body;

    const training = await Training.findById(trainingId);
    if (!training) return res.status(404).json({ message: 'Training not found' });

    const chapter = training.chapters.id(chapterId);
    if (!chapter) return res.status(404).json({ message: 'Chapter not found' });

    const index = chapter.indexes.id(indexId);
    if (!index) return res.status(404).json({ message: 'Index not found' });

    if (name) index.name = name;
    if (pageNo !== undefined) index.pageNo = pageNo;
    if (req.body.videoStartTime !== undefined) index.videoStartTime = req.body.videoStartTime;
    if (req.body.videoEndTime !== undefined) {
        if (req.body.videoEndTime <= req.body.videoStartTime) {
            return res.status(400).json({ message: 'Video end time must be greater than start time' });
        }
        index.videoEndTime = req.body.videoEndTime;
    }

    await training.save();

    res.status(200).json({ message: 'Index updated successfully', index });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error updating index', error: err.message });
  }
};


//delete index controller
exports.deleteIndex = async (req, res) => {
  try {
    const { trainingId, chapterId, indexId } = req.params;

    const training = await Training.findById(trainingId);
    if (!training) return res.status(404).json({ message: 'Training not found' });

    const chapter = training.chapters.id(chapterId);
    if (!chapter) return res.status(404).json({ message: 'Chapter not found' });

    chapter.indexes = chapter.indexes.filter((idx) => idx._id.toString() !== indexId);

    await training.save();

    res.status(200).json({ message: 'Index deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error deleting index', error: err.message });
  }
};



// Get indexes for a chapter
exports.getIndexes = async (req, res) => {
  try {
    const { trainingId, chapterId } = req.params;

    const training = await Training.findById(trainingId);
    if (!training) return res.status(404).json({ message: "Training not found" });

    const chapter = training.chapters.id(chapterId);
    if (!chapter) return res.status(404).json({ message: "Chapter not found" });

    res.status(200).json({ indexes: chapter.indexes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching indexes", error: err.message });
  }
};





//add sub-index nested controller
exports.addAnySubIndex = async (req, res) => {
  try {
    const { trainingId, chapterId } = req.params;
    const { parentIndexId, name, pageNo } = req.body;

    const training = await Training.findById(trainingId);
    if (!training) return res.status(404).json({ message: 'Training not found' });

    const chapter = training.chapters.id(chapterId);
    if (!chapter) return res.status(404).json({ message: 'Chapter not found' });

    let isAdded = false;

    // ✅ Fully recursive function (infinite depth)
    const addSubIndexRecursive = (indexes) => {
      for (let idx of indexes) {
        if (idx._id.toString() === parentIndexId) {
          if (req.body.videoEndTime <= req.body.videoStartTime) {
            return res.status(400).json({ message: 'Video end time must be greater than start time' });
        }
          const newSubIndex = {
            _id: new mongoose.Types.ObjectId(),
            name,
            pageNo,
            videoStartTime: req.body.videoStartTime || 0,   // ✅ add this
            videoEndTime: req.body.videoEndTime || 0, 
            subIndexes: []
          };
          if (!idx.subIndexes) idx.subIndexes = [];
          idx.subIndexes.push(newSubIndex);
          isAdded = true;
          return true;  // ✅ found & added, bubble up
        }
        if (idx.subIndexes && idx.subIndexes.length > 0) {
          const found = addSubIndexRecursive(idx.subIndexes);
          if (found) return true;  // ✅ propagate success
        }
      }
      return false;
    };

    const success = addSubIndexRecursive(chapter.indexes);
    if (!success) return res.status(404).json({ message: 'Parent index not found' });

    chapter.markModified('indexes'); // ✅ force Mongoose to track deep change

    await training.save();

    res.status(200).json({ message: 'SubIndex added successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error adding subIndex', error: err.message });
  }
};


//edit sub-index nested controller
exports.updateSubIndex = async (req, res) => {
  try {
    const { trainingId, chapterId, subIndexId } = req.params;
    const { name, pageNo } = req.body;

    const training = await Training.findById(trainingId);
    if (!training) return res.status(404).json({ message: 'Training not found' });

    const chapter = training.chapters.id(chapterId);
    if (!chapter) return res.status(404).json({ message: 'Chapter not found' });

    let updated = false;

    // ✅ Recursive function to find and update the subindex
    const updateRecursive = (indexes) => {
      for (let idx of indexes) {
        if (idx._id.toString() === subIndexId) {
          if (name) idx.name = name;
          if (pageNo !== undefined) idx.pageNo = pageNo;
          if (name) idx.name = name;
          if (pageNo !== undefined) idx.pageNo = pageNo;
          if (req.body.videoStartTime !== undefined) idx.videoStartTime = req.body.videoStartTime;
          if (req.body.videoEndTime !== undefined) {
              if (req.body.videoEndTime <= req.body.videoStartTime) {
                  return res.status(400).json({ message: 'Video end time must be greater than start time' });
              }
              idx.videoEndTime = req.body.videoEndTime;
          }
                 
          updated = true;
          return true;
        }
        if (idx.subIndexes && idx.subIndexes.length > 0) {
          const found = updateRecursive(idx.subIndexes);
          if (found) return true;
        }
      }
      return false;
    };

    const success = updateRecursive(chapter.indexes);
    if (!success) return res.status(404).json({ message: 'SubIndex not found' });

    chapter.markModified('indexes');

    await training.save();

    res.status(200).json({ message: 'SubIndex updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error updating subIndex', error: err.message });
  }
};



//delete sub-index controller
exports.deleteSubIndex = async (req, res) => {
  try {
    const { trainingId, chapterId, subIndexId } = req.params;

    const training = await Training.findById(trainingId);
    if (!training) return res.status(404).json({ message: 'Training not found' });

    const chapter = training.chapters.id(chapterId);
    if (!chapter) return res.status(404).json({ message: 'Chapter not found' });

    let deleted = false;

    // ✅ Recursive function to find and delete the subindex
    const deleteRecursive = (indexes) => {
      for (let i = 0; i < indexes.length; i++) {
        if (indexes[i]._id.toString() === subIndexId) {
          indexes.splice(i, 1);
          deleted = true;
          return true;
        }
        if (indexes[i].subIndexes && indexes[i].subIndexes.length > 0) {
          const found = deleteRecursive(indexes[i].subIndexes);
          if (found) return true;
        }
      }
      return false;
    };

    const success = deleteRecursive(chapter.indexes);
    if (!success) return res.status(404).json({ message: 'SubIndex not found' });

    chapter.markModified('indexes');

    await training.save();

    res.status(200).json({ message: 'SubIndex deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error deleting subIndex', error: err.message });
  }
};



//test linked with chapter 
exports.linkTestToChapter = async (req, res) => {
  const { trainingId, chapterId } = req.params;
  const { testId } = req.body;

  try {
    const training = await Training.findById(trainingId);

    if (!training) {
      return res.status(404).json({ message: "Training not found" });
    }

    const chapter = training.chapters.id(chapterId);

    if (!chapter) {
      return res.status(404).json({ message: "Chapter not found" });
    }

    chapter.linkedTestId = testId;
    await training.save();

    res.status(200).json({
      message: "Test linked to chapter successfully",
      chapter
    });

  } catch (err) {
    console.error("Error linking test to chapter:", err);
    res.status(500).json({
      message: "Error linking test",
      error: err.message
    });
  }
};

//test unlink controller
exports.unlinkTestFromChapter = async (req, res) => {
  const { trainingId, chapterId } = req.params;

  try {
    const training = await Training.findById(trainingId);
    if (!training) return res.status(404).json({ message: "Training not found" });

    const chapter = training.chapters.id(chapterId);
    if (!chapter) return res.status(404).json({ message: "Chapter not found" });

    chapter.linkedTestId = undefined; // 🔓 Unlinking
    await training.save();

    res.status(200).json({ message: "Test unlinked successfully", chapter });
  } catch (err) {
    console.error("Unlink error:", err);
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};


// ✅ Set unlocksChapters for a chapter
exports.setUnlocksForChapter = async (req, res) => {
  const { trainingId, chapterId } = req.params;
  const { unlocksChapters } = req.body;

  try {
    const training = await Training.findById(trainingId);

    if (!training) return res.status(404).json({ message: "Training not found" });

    const chapter = training.chapters.find(ch => ch._id.toString() === chapterId);
    if (!chapter) return res.status(404).json({ message: "Chapter not found" });

    // ✅ Set unlocksChapters
    chapter.unlocksChapters = unlocksChapters;

    // ✅ Now update dependentChapters of all chapters to be unlocked
    unlocksChapters.forEach(unlockId => {
      const target = training.chapters.find(ch => ch._id.toString() === unlockId);
      if (target) {
        if (!target.dependentChapters.includes(chapter._id)) {
          target.dependentChapters.push(chapter._id);
        }
      }
    });

    await training.save();
    res.status(200).json({ message: "Unlocks set successfully", chapter });
  } catch (err) {
    console.error("Error in setUnlocksForChapter:", err);
    res.status(500).json({ message: "Error setting unlocks", error: err.message });
  }
};


// ✅ Remove multiple unlocks from a chapter and their dependencies
exports.removeUnlocksFromChapter = async (req, res) => {
  const { trainingId, chapterId } = req.params;
  const { removeChapterIds } = req.body; // array of chapters to remove from unlocks

  try {
    const training = await Training.findById(trainingId);
    if (!training) return res.status(404).json({ message: "Training not found" });

    const chapter = training.chapters.id(chapterId);
    if (!chapter) return res.status(404).json({ message: "Chapter not found" });

    // 1. Remove from current chapter's unlocksChapters array
    chapter.unlocksChapters = chapter.unlocksChapters.filter(
      (id) => !removeChapterIds.includes(id.toString())
    );

    // 2. Remove this chapter from the dependentChapters of the target chapters
    removeChapterIds.forEach((targetId) => {
      const target = training.chapters.id(targetId);
      if (target) {
        target.dependentChapters = target.dependentChapters.filter(
          (depId) => depId.toString() !== chapterId
        );
      }
    });

    await training.save();
    res.status(200).json({ message: "Unlocks and dependencies removed successfully", chapter });
  } catch (err) {
    console.error("Error in removeUnlocksFromChapter:", err);
    res.status(500).json({ message: "Error removing unlocks", error: err.message });
  }
};



// ✅ Get unlock chapters for a specific chapter
exports.getUnlockChaptersOfChapter = async (req, res) => {
  const { trainingId, chapterId } = req.params;

  try {
    const training = await Training.findById(trainingId);
    if (!training) {
      return res.status(404).json({ message: "Training not found" });
    }

    const chapter = training.chapters.find(ch => ch._id.toString() === chapterId);
    if (!chapter) {
      return res.status(404).json({ message: "Chapter not found" });
    }

    return res.status(200).json({
      unlocksChapters: chapter.unlocksChapters || [],
    });
  } catch (err) {
    console.error("Error in getUnlockChaptersOfChapter:", err);
    return res.status(500).json({ message: "Error fetching unlocks", error: err.message });
  }
};


//reverse dependency set and push into unlock chapters
exports.setReverseDependencies = async (req, res) => {
  const { trainingId, chapterId } = req.params;
  const { dependencyChapterIds } = req.body;

  try {
    const training = await Training.findById(trainingId);
    if (!training) return res.status(404).json({ message: 'Training not found' });

    const currentChapter = training.chapters.find(ch => ch._id.toString() === chapterId);
    if (!currentChapter) return res.status(404).json({ message: 'Target chapter not found' });

    // ✅ Validation: ensure all dependencies have test linked
    for (const depId of dependencyChapterIds) {
      const depChapter = training.chapters.find(ch => ch._id.toString() === depId);
      if (!depChapter?.linkedTestId) {
        return res.status(400).json({
          message: `Cannot set dependency on Chapter '${depChapter?.name || depId}' — test not linked.`,
        });
      }
    }

    // ✅ Set dependencies
    currentChapter.dependentChapters = dependencyChapterIds;

    // ✅ Push chapterId to unlocksChapters of dependency chapters
    for (const depId of dependencyChapterIds) {
      const depChapter = training.chapters.find(ch => ch._id.toString() === depId);
      if (depChapter && !depChapter.unlocksChapters.includes(chapterId)) {
        depChapter.unlocksChapters.push(chapterId);
      }
    }

    await training.save();
    res.status(200).json({ message: 'Dependencies set successfully' });
  } catch (err) {
    console.error('Dependency error:', err);
    res.status(500).json({ message: 'Server error while setting dependencies' });
  }
};








  
  