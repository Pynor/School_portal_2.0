export type UserData = {
    id: number;
    bio: string;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    birth_date: string;
    is_staff: boolean;
};

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

export type Task = {
    sequence_number: number;
    answer_to_the_task: string;
    title: string;
    description: string;
    additional_condition?: string;
    time_to_task?: string;
  };
  
export interface TaskList {
    title: string;
    count_task: number;
    task_for: string;
    tasks: Task[];
};