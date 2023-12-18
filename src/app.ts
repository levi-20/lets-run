import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import { generateKeyPair, verifySignature } from './utils/crypto.util'
import { v4 as uuidv4 } from 'uuid';
import { calculateRanking } from './helpers/helper'


const app = express();
const PORT = 9001;

app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect('mongodb://mongo:27017/letsrun');

// Define MongoDB schema and model
const userSchema = new mongoose.Schema({
    id: String,
    name: String,
    age: Number,
    city: String,
    total_distance_run: Number,
    publicKey: String,
    privateKey: String
});

const User = mongoose.model('User', userSchema);

app.post('/signup', async (req: Request, res: Response) => {
    try {
        const { name, age, city } = req.body;
        // Generate RSA key pair
        const { publicKey, privateKey } = generateKeyPair();

        // Save user data to the database
        const user = new User({ id: uuidv4(), name, age, city, total_distance_run: 0, publicKey, privateKey });
        await user.save();

        res.json({ privateKey });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.put('/update', async (req: Request, res: Response) => {
    try {
        if (req.body?.request) {

            const [base64Data, signature] = req.body.request.split('.');
            let data: any = Buffer.from(base64Data, 'base64').toString('utf-8');
            data = JSON.parse(data);

            const userdata: any = await User.find({ name: data.name });

            const userToUpdate = userdata.find((user: any) => verifySignature(base64Data, signature, user.publicKey) == true);

            if (userToUpdate) {
                userToUpdate.total_distance_run += data.distance;
                const updatedUser = new User(userToUpdate);
                updatedUser.save();
                res.json({ totalDistanceRun: updatedUser.total_distance_run })
            } else {
                res.json({ totalDistanceRun: -1 })
            }

        } else {
            res.status(400).json({ message: 'missing required fields the \"request\" ' })
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/mystats', async (req: Request, res: Response) => {
    try {
        const [base64Data, signature] = req.body.request.split('.');
        let data: any = Buffer.from(base64Data, 'base64').toString('utf-8');
        data = JSON.parse(data);

        const userdata: any = await User.find();
        const userToRank = userdata.find((user: any) => verifySignature(base64Data, signature, user.publicKey) == true);
        if (userToRank) {
            const ranking = calculateRanking(userdata, userToRank, data.type);
            res.json({ ranking });
        } else {
            res.json({ ranking: -1 });
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
