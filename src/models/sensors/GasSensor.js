import mongoose from 'mongoose';
import Sensor from './Sensor.js';

const gasSensorSchema = new mongoose.Schema({
  currentMethanLevel: Number, // Рівень метану (CH4)
  currentCarbonMonoxideLevel: Number, // Рівень монооксиду вуглецю (CO)
  currentCarbonDioxideLevel: Number, // Рівень вуглекислого газу (CO2)
  currentPropaneLevel: Number, // Рівень пропану (C3H8)
  currentNitrogenDioxideLevel: Number, // Рівень діоксиду азоту (NO2)
  currentOzoneLevel: Number, // Рівень озону (O3)
  dangerousMethanLevel: Number, // Небезпечний рівень метану
  dangerousCarbonMonoxideLevel: Number, // Небезпечний рівень CO
  dangerousCarbonDioxideLevel: Number, // Небезпечний рівень CO2
  dangerousPropaneLevel: Number, // Небезпечний рівень пропану
  dangerousNitrogenDioxideLevel: Number, // Небезпечний рівень діоксиду азоту
  dangerousOzoneLevel: Number, // Небезпечний рівень озону
});

const GasSensor = Sensor.discriminator('gas_sensor', gasSensorSchema);

export default GasSensor;