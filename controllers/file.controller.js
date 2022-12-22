const db = require("../index");
const userColl = db.collection("user");
const APIError = require("../helpers/APIError");
const resPattern = require("../helpers/resPattern");
const httpStatus = require("http-status");
const query = require("../query/query");
const bcrypt = require("bcrypt");
const moment = require("moment");
const jwt = require("jsonwebtoken");
const fs = require('fs');
const Pitchfinder = require('pitchfinder')
const WavDecoder = require('wav-decoder')
const decodesongColl = db.collection("song");
const { ObjectID } = require("mongodb");


exports.fileConvert = async (req, res, next) => {
  try {
    let middleA = 440;
    let semitone = 69;
    let noteStrings = [
      "C",
      "C♯",
      "D",
      "D♯",
      "E",
      "F",
      "F♯",
      "G",
      "G♯",
      "A",
      "A♯",
      "B",
    ];
    const SampleRate = 44100
    const detectPitch = new Pitchfinder.YIN({ sampleRate: SampleRate });
    // deepcode ignore PT: <please specify a reason of ignoring this>
    const buffer = fs.readFileSync(req.file.path);
    const decoded = WavDecoder.decode.sync(buffer);
    const float32Array = decoded.channelData[0];

    const detectors = [detectPitch, Pitchfinder.AMDF()];
    const moreAccurateFrequencies = Pitchfinder.frequencies(
      detectors,
      float32Array,
      {
        tempo: 130,
        quantization: 4,
      }
    );
    var arr2 = moreAccurateFrequencies.filter(element => element < 910 && element > 0).map((frequency) => (
      {
        name: noteStrings[(Math.round(12 * (Math.log(frequency / middleA) / Math.log(2))) + semitone) % 12],
        octave: parseInt(Math.round(12 * (Math.log(frequency / middleA) / Math.log(2))) / 12) - 1,
        frequency: frequency,
      }))

    let object = {
      frequencies: arr2,
      name: req.file.originalname,
    }

    const insertdata = await query.insert(decodesongColl, object);

    const obj = resPattern.successPattern(200, { result: object }, `success`);
    return res.status(obj.code).json({
      ...obj
    });

  } catch (e) {
    return next(new APIError(`${e.message}`, httpStatus.BAD_REQUEST, true));

  }
};


exports.getDecodedSongs = async (req, res, next) => {
  try {
    const songslist = await query.find(decodesongColl, {}, "")

    if (songslist) {
      let obj = resPattern.successPattern(
        httpStatus.OK,
        { songslist },
        "success"
      );
      return res.status(obj.code).json(obj);
    } else {
      const message = `Songs not found `;
      return next(new APIError(`${message}`, httpStatus.BAD_REQUEST, true));
    }
  } catch (e) {
    return next(new APIError(`${e.message}`, httpStatus.BAD_REQUEST, true));
  }
}

exports.getSongById = async (req, res, next) => {
  try {
    console.log("reqqqq", req.params.id)
    // const song = await query.findOne({ _id: ObjectID(req.params.id) })
    const song = await query.findOne(decodesongColl, { _id: ObjectID(req.params.id) })
    if (song) {
      let obj = resPattern.successPattern(httpStatus.OK, { song }, "success");
      return res.status(obj.code).json(obj);
    } else {
      const message = `Subject not found with id: '${id}.`;
      return next(new APIError(`${message}`, httpStatus.BAD_REQUEST, true));
    }
  } catch (e) {
    return next(new APIError(`${e.message}`, httpStatus.BAD_REQUEST, true));
  }
}

exports.deleteSong = async (req, res, next) => {
  try {
    console.log('reqq', req.params.id)

    let subjectId = ObjectID(req.params.id);

    const song = await query.deleteOne(decodesongColl, {
      _id: subjectId,
    });

    if (song.deletedCount !== 0) {
      let obj = resPattern.successMessge(httpStatus.OK, "Delete successfully");
      return res.status(obj.code).json(obj);
    } else {
      const message = `Song not found with id: '${req.params.id}.`;
      return next(new APIError(`${message}`, httpStatus.BAD_REQUEST, true));
    }

  } catch (e) {
    return next(new APIError(`${e.message}`, httpStatus.BAD_REQUEST, true));
  }
}

exports.updateSong = async (req, res, next) => {
  try {
    let subjectId = ObjectID(req.params.id);
    let subjectData = req.file;
    console.log("fileee", subjectData)

    let middleA = 440;
    let semitone = 69;
    let noteStrings = [
      "C",
      "C♯",
      "D",
      "D♯",
      "E",
      "F",
      "F♯",
      "G",
      "G♯",
      "A",
      "A♯",
      "B",
    ];
    const SampleRate = 44100
    const detectPitch = new Pitchfinder.YIN({ sampleRate: SampleRate });
    // deepcode ignore PT: <please specify a reason of ignoring this>
    const buffer = fs.readFileSync(req.file.path);
    const decoded = WavDecoder.decode.sync(buffer);
    const float32Array = decoded.channelData[0];

    const detectors = [detectPitch, Pitchfinder.AMDF()];
    const moreAccurateFrequencies = Pitchfinder.frequencies(
      detectors,
      float32Array,
      {
        tempo: 130,
        quantization: 4,
      }
    );

    var arr2 = moreAccurateFrequencies.filter(element => element < 910 && element > 0).map((frequency) => (
      {
        name: noteStrings[(Math.round(12 * (Math.log(frequency / middleA) / Math.log(2))) + semitone) % 12],
        octave: parseInt(Math.round(12 * (Math.log(frequency / middleA) / Math.log(2))) / 12) - 1,
        frequency: frequency,
      }))

    let objectData = {
      frequencies: arr2,
      name: req.file.originalname,
    }

    objectData.updatedAt = moment().utc().format();
    const subjectUpdate = await query.findOneAndUpdate(
      decodesongColl,
      { _id: subjectId },
      { $set: objectData },
      { returnOriginal: false }
    );
    if (!subjectUpdate.lastErrorObject.updatedExisting) {
      const message = `song not found with id: '${req.params.id}.`;
      return next(new APIError(`${message}`, httpStatus.BAD_REQUEST, true));
    } else {
      let subject = subjectUpdate.value;
      const obj = resPattern.successPattern(
        httpStatus.OK,
        { subject },
        `success`
      );
      return res.status(obj.code).json(obj);
    }
  } catch (e) {
    return next(new APIError(`${e.message}`, httpStatus.BAD_REQUEST, true));
  }
}