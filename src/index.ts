import express, { Request, Response } from 'express';

const app = express();
const port = 8001;
app.use(express.json());

interface identifyR {
  email?: string,
  phoneNumber?: number
}

app.post('/identify', (req: Request<{}, {}, identifyR>, res: Response) => {
  const { email, phoneNumber } = req.body;
  if (!email && !phoneNumber) {
    return res.status(400).json({
      error: "email or phoneNumber required!"
    });
  }
  console.log("Request: ", req.body);
  res.json({
    message: "This is a responce",
    email,
    phoneNumber
  });
});

app.listen(port, () => {
  console.log(`Server running on: ${port}`);
});
