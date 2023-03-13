input.onButtonPressed(Button.A, function () {
    rekabit.runMotor(MotorChannel.M2, MotorDirection.Forward, 128)
    basic.pause(2000)
    rekabit.brakeMotor(MotorChannel.M2)
})
input.onButtonPressed(Button.AB, function () {
    springklerError = false
    waterRuns = 0
})
let moistureMessageTank = ""
let moistureMessage2 = ""
let wateringInProgress = false
let hasWaterInTank = false
let waterRuns = 0
let eventCounter = 0
let springklerError = false
let moistureMessage = ""
let MAX_TRIES = 20
OLED.init(128, 64)
OLED.clear()
OLED.writeNumNewLine(rekabitSoilMoisture.soilMoistureLevel(RekabitAnalogInPin.P0))


loops.everyInterval(60000, function () {
    hasWaterInTank = rekabitSoilMoisture.soilMoistureLevel(RekabitAnalogInPin.P2) < 500
    let moisture = rekabitSoilMoisture.soilMoistureLevel(RekabitAnalogInPin.P0)
    if (moisture > 600 && hasWaterInTank && !(springklerError)) {
        wateringInProgress = true
        rekabit.runMotor(MotorChannel.M2, MotorDirection.Forward, 128)
        basic.pause(1000)
        while (moisture > 600 && waterRuns < MAX_TRIES) {
            moisture = rekabitSoilMoisture.soilMoistureLevel(RekabitAnalogInPin.P0)
            waterRuns += 1
            basic.pause(2000)
        }
        if (waterRuns >= MAX_TRIES) {
            springklerError = true
        } else {
            eventCounter += 1
        }
        rekabit.brakeMotor(MotorChannel.M2)
        wateringInProgress = false
    }
})
basic.forever(function () {
	
})

let moistureLevel_t: number[] = [];
loops.everyInterval(3600000, function() {
    let level = rekabitSoilMoisture.soilMoistureLevel(RekabitAnalogInPin.P0)
    moistureLevel_t.push(level)
    if (moistureLevel_t.length > 100) {
        moistureLevel_t.shift()
    }
})

loops.everyInterval(10000, function () {
    let currentTemp = input.temperature()
    moistureMessage2 = "Moisture Level: " + rekabitSoilMoisture.soilMoistureLevel(RekabitAnalogInPin.P0)
    moistureMessageTank = "Tank: " + ""
    OLED.clear()
    if (springklerError) {
        OLED.writeStringNewLine("Problem with water pump or moisture sensor! Press the A+B button to reset")
    } else {
        if (wateringInProgress) {
            OLED.writeStringNewLine("Watering..." + waterRuns + ": " + rekabitSoilMoisture.soilMoistureLevel(RekabitAnalogInPin.P0))
        } else {
            OLED.writeStringNewLine(moistureMessage2)
            OLED.writeStringNewLine("Pump Count: " + eventCounter)
            OLED.writeStringNewLine("Temp: " + currentTemp + "C")
        }
    }
    let tankLevel = rekabitSoilMoisture.soilMoistureLevel(RekabitAnalogInPin.P2)
    if (tankLevel< 500) {
        OLED.writeStringNewLine("Tank Water OK " + tankLevel)
    } else {
        OLED.writeStringNewLine("Tank out of water!")
    }
    for (let i = 0; i < moistureLevel_t.length && i < 32; i++) {
        let start = i * 4
        let offset = (moistureLevel_t[i] - 200) * 32 / 700
        OLED.drawRectangle(start, 32 + offset, start + 3, 62)
    }

})
