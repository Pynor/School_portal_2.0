import { useMemo } from "react";

export type UserData = {
  first_name: string;
  birth_date: string;
  last_name: string;
  is_staff: boolean;
  student?: Student;
  username: string;
  email: string;
  bio: string;
  id: number;
};

export type StudentForRegister = {
  school_class: string;
  first_name: string;
  last_name: string;
};

export type Student = {
  school_class: string;
  authorized?: boolean;
  first_name: string;
  last_name: string;
};


export type Props = {
  userData: {
    username: string;
    id: number;
  };
};

export type TaskList = {
  task_list: [{
    count_task: number;
    task_for: string;
    title: string;
    tasks: Task[];
    id: number;
  }]
};

export type TaskListForAddTasks = {
  count_task: number;
  task_for: string;
  title: string;
  tasks: Task[];
};

export type Task = {
  additional_condition?: string;
  answer_to_the_task: string;
  sequence_number: number;
  time_to_task?: string;
  description: string;
  title: string;
  id: number;
};

export type AnswerList = {
  task_list: number;
  answers: Answer[];
  user: number;
};

export type StudentAndAnswer = {
  answers: Answer[];
  student: Student;
};

export type Answer = {
  photo_to_the_answer: File | null;
  task: number | string;
  answer: string;
};

const useDefaultState = () => {
  const defaultTasksListData: TaskList = useMemo(
    () => ({task_list: [{
      count_task: 0,
      task_for: "",
      title: "",
      id: 0,
      tasks: [], }]
    }),
  []
    );

const defaultUserData: UserData = useMemo(
  () => ({
    student: {
      school_class: "",
      first_name: "",
      last_name: "",
    },
    is_staff: false,
    first_name: "",
    birth_date: "",
    last_name: "",
    username: "",
    email: "",
    bio: "",
    id: 0,
  }),
  []
);

return { defaultTasksListData, defaultUserData };
  };

export default useDefaultState;