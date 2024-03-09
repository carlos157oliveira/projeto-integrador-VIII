import 'dotenv/config'
import express from 'express'
import { TextMessageService } from 'comtele-sdk'

const port = process.env.PORT || 8080
const apiKey = process.env.COMTELE_API_KEY
const receivers = process.env.RECEIVERS.split('|')
const textMessageService = new TextMessageService(apiKey);
const app = express()

app.use(express.json())

enum DeviceStatus {
    UP = 'up',
    DOWN = 'down',
    WARNING = 'warning'
}

enum DeviceAction {
    MAINTENANCE_REQUIRED = "maintenance_required"
}

interface DeviceMessage {
    device: {
        status: DeviceStatus
        action: DeviceAction
    }
    water_level: number
}

app.post('/send-sms', (req, res) => {
    if (!req.headers.authorization) {
        return res.status(401).json({ message: 'Unauthorized' })
    }
    const deviceMessage = req.body as DeviceMessage
    let content: string
    const waterLevel = deviceMessage.water_level

    if (isNaN(waterLevel)) {
        console.log('Nível de água especificado incorretamente!')
        return
    }

    if (waterLevel < 1) {
        console.log('Nível de risco 0. Nenhuma ação a ser tomada.')
        return res.status(204).send()
    } else if (waterLevel < 2) {
        content = 'Nível de risco 1. Atente-se.'
    } else {
        content = 'Nível de risco 2. Evacue as imediações!'
    }

    const sender = 'Alerta de nível de água'
    textMessageService.send(sender, content, receivers, data => console.log(data))
    return res.status(204).send()
})

app.listen(port, () => {
    console.log('Listening on port %d', port)
})