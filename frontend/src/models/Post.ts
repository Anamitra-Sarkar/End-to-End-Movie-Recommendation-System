import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPost extends Document {
    user: string;
    avatar: string;
    content: string;
    movie?: string;
    rating?: number;
    likes: number;
    replies: number;
    createdAt: Date;
    updatedAt: Date;
}

const PostSchema: Schema = new Schema(
    {
        user: {
            type: String,
            required: true,
        },
        avatar: {
            type: String,
            default: '🎬',
        },
        content: {
            type: String,
            required: true,
            maxlength: 500,
        },
        movie: {
            type: String,
        },
        rating: {
            type: Number,
            min: 1,
            max: 5,
        },
        likes: {
            type: Number,
            default: 0,
        },
        replies: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

// Prevent model recompilation in development
const Post: Model<IPost> = mongoose.models.Post || mongoose.model<IPost>('Post', PostSchema);

export default Post;
