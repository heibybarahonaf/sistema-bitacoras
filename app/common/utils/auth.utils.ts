import bcrypt from "bcrypt";

export class AuthUtils {

    public static async hashPassword(password: string): Promise<string> {
        return await bcrypt.hash(password, 10);
    }


    public static async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
        return await bcrypt.compare(password, hashedPassword);
    }

}
