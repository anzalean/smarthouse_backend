import mongoose from 'mongoose';
import Device from './Device.js';

const smartLightSchema = new mongoose.Schema({
  brightness: Number, // яскравість від 0 до 100
  color: {
    type: String,
    enum: [
      'white', 
      'warm_white', 
      'daylight', 
      'soft_white',
      'cool_white',
      'candle', 
      'sunset', 
      'sunrise', 
      'deep_blue', 
      'ocean_blue',
      'sky_blue',
      'turquoise', 
      'mint', 
      'forest_green', 
      'lime', 
      'yellow', 
      'amber', 
      'orange', 
      'red', 
      'pink', 
      'fuchsia', 
      'purple', 
      'lavender',
      'night_mode',
      'reading_mode',
      'movie_mode',
      'party_mode',
      'relax_mode',
      'focus_mode',
    ]
  }, 
});

const SmartLight = Device.discriminator('smart_light', smartLightSchema);
export default SmartLight; 