import express, { Request, Response } from 'express';
import { prisma } from "./prisma";
import { LinkPrecedence } from './generated/prisma/enums';
import 'dotenv/config'

const app = express();
const port = 8001;
app.use(express.json());

interface identifyR {
  email?: string,
  phoneNumber?: number
}

app.post('/identify', async (req: Request<{}, {}, identifyR>, res: Response) => {
  const { email, phoneNumber } = req.body;
  if (!email && !phoneNumber) {
    return res.status(400).json({
      error: "email or phoneNumber required!"
    });
  }
  // console.log(process.env.DATABASE_URL);

  console.log("Request: ", req.body);

  const contact = await prisma.contact.findMany({
    where: {
      OR: [
        { email: email ?? undefined },
        { phoneNumber: phoneNumber ?? undefined }
      ]
    }
  });
  if (contact.length === 0) {
    const newcontact = await prisma.contact.create({
      data: {
        email,
        phoneNumber,
        linkPrecedence: LinkPrecedence.primary
      }
    });
    res.json({
      message: "New Record Created:",
      contact: newcontact
    })
    return
  }
  res.json({
    message: "Record Found!",
    contact: contact
  });
});

// ** TESTING **
app.get('/api/debug/get-db', async (req: Request, res: Response) => {
  const contact = await prisma.contact.findMany();
  res.json(contact);
});

app.listen(port, () => {
  console.log(`Server running on: ${port}`);
});
