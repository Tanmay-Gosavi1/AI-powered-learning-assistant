import User from '../models/User.js'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

export const login = async (req, res) => {
    try {
        const {email, password} = req.body;

        const user = await User.findOne({email});
        if(!user){
            return res.status(404).json({message: "User not found"});
        }
        let isPasswordValid = false;
        if(await bcrypt.compare(password, user.password)){
            isPasswordValid = true;
        }
        if(!isPasswordValid){
            return res.status(401).json({message: "Invalid email or password"});
        }

        const token = jwt.sign({id : user._id}, process.env.JWT_SECRET, {expiresIn: '7d'});

        return res.status(200).json({
            success : true,
            message : "User logged in successfully",
            data : {
                user : {
                    id : user._id,
                    name : user.name,
                    email : user.email,
                    profileImage : user.profileImg,
                    createdAt : user.createdAt,
                },
            },
            token
        })
    } catch (error) {
        return res.status(500).json({success : false, message : "Error while logging in", error : error.message});
    }
}

export const signup = async (req, res) => {
    try {
        const {name , email, password} = req.body;

        const existingUser = await User.findOne({email});
        if(existingUser){
            return res.status(400).json({message: "User already exists"});
        }

        const hashedPassword = await bcrypt.hash(password, 10); // Replace with actual hashing logic

        const newUser = await User.create({name, email, password: hashedPassword});

        const token = jwt.sign({id : newUser._id}, process.env.JWT_SECRET, {expiresIn: '7d'});

        return res.status(201).json({
            success : true,
            message : "User created successfully",
            user : {
                id : newUser._id,
                name : newUser.name,
                email : newUser.email,
                profileImage : newUser.profileImg,
                createdAt : newUser.createdAt,
            },
            token
        })
    } catch (error) {
        return res.status(500).json({success : false, message : "Error while creating user", error : error.message});
    }
}

export const getProfile = async (req, res) => {
    try {
        const userId = req.user.id
        const user = await User.findById(userId);

        return res.status(200).json({
            success : true,
            message : "User profile fetched successfully",
            data : {
                user : {
                    id : user._id,
                    name : user.name,
                    email : user.email,
                    profileImage : user.profileImg,
                    createdAt : user.createdAt,
                }
            }
        })
    } catch (error) {
        return res.status(500).json({success : false, message : "Error while fetching user profile", error : error.message});
    }
}

export const updateProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const {name, email ,  profileImage} = req.body;

        if(name) user.name = name;
        if(email) user.email = email;
        if(profileImage) user.profileImg = profileImage;

        await user.save();

        return res.status(200).json({
            success : true,
            message : "User profile updated successfully",
            data : {
                user : {
                    id : user._id,
                    name : user.name,
                    email : user.email,
                    profileImage : user.profileImg,
                    createdAt : user.createdAt,
                }
            }
        })
    } catch (error) {
        return res.status(500).json({success : false, message : "Error while updating user profile", error : error.message});
    }
}

export const changePassword = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const {oldPassword, newPassword} = req.body;

        let isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
            
        if(!isOldPasswordValid){
            return res.status(401).json({message: "Old password is incorrect"});
        }
        
        // Hashed password
        const hashedPassword = await bcrypt.hash(newPassword, 10); // Replace with actual hashing logic
        user.password = hashedPassword;
        await user.save();

        return res.status(200).json({
            success : true,
            message : "Password changed successfully",
        })
    } catch (error) {
        return res.status(500).json({success : false, message : "Error while changing password", error : error.message});
    }
}