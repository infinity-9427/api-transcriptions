import { PrismaClient } from '@prisma/client';
import Joi from 'joi';
import { Request, RequestHandler, Response } from 'express'; 
import bcrypt from 'bcrypt';


const prisma = new PrismaClient();

const userSchema = Joi.object({
  name: Joi.string().min(3).max(100).required(),
  email: Joi.string().email().max(100).required(),
  password: Joi.string().min(6).required(), 
});

export const createUser: RequestHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const { error, value } = userSchema.validate(req.body);
    if (error) {
      // Check if any error detail relates to the 'email' field.
      const emailError = error.details.find(detail => detail.context?.key === 'email');
      const errorMessage = emailError ? 'Invalid email format.' : 'Invalid request data.';
      
      res.status(400).json({ error: errorMessage });
      return;
    }

    const { name, email, password } = value;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(400).json({ error: 'User already exists' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    res.status(201).json({
      message: 'User created successfully',
      user: { id: user.id, email: user.email, name: user.name },
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


export const getAllUsers: RequestHandler = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name:true,
      },
    });
    res.json(users);
  } catch (error) {
    console.error('Error getting all users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error getting user by ID:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { error, value } = userSchema.validate(req.body, { abortEarly: false, allowUnknown: true }); 

    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { id } = req.params;
    const { name, email, password } = value;

    const existingUser = await prisma.user.findUnique({where:{email:email}});

    if(existingUser && existingUser.id !== parseInt(id)){
      return res.status(400).json({error:"Email already in use by another user"})
    }

    let updateData: { name?:string, email?: string; password?: string } = { name, email };

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateData.password = hashedPassword;
    }

    const updatedUser = await prisma.user.update({
      where: { id: parseInt(id) },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    res.json({ message: 'User updated successfully', user: updatedUser });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.user.delete({
      where: { id: parseInt(id) },
    });

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
