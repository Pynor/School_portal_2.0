export type UserData = {
    id: number;
    bio: string;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    birth_date: string;
    is_staff: boolean;
  }
export  type Student = {
    last_name: string;
    first_name: string;
    school_class: string;
};

export type Props = {
    userData: {
        id: number;
        username: string;
    };
};