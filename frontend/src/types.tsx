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
    time_to_tasks: string,
    count_task: number;
    task_for: string;
    title: string;
    tasks: Task[];
    id: number;
  }]
};

export interface ModalProps {
  onClose: () => void;
  imageSrc: string;
  isOpen: boolean;
}

export type TaskListForAddTasks = {
  time_to_tasks: string,
  count_task: number;
  task_for: string;
  title: string;
  tasks: Task[];
};

export type Task = {
  additional_condition?: string;
  answer_to_the_task: string;
  link_to_article?: string;
  sequence_number: number;
  description: string;
  video_file?: File;
  photo_file?: File;
  docx_file?: File;
  title: string;
  id: number;
};

export type AnswerList = {
  task_list: number;
  answers: Answer[];
  user: number;
};

export type StudentAndAnswerForCheckAnswers = {
  student: Student;
  tasks_and_answers: Array<{
    execution_time_answer: number;
    answer: Answer,
    task: Task
  }>;
};

export type Answer = {
  photo_to_the_answer: File | null;
  task: number | string;
  answer: string;
};

const useDefaultState = () => {
  const defaultTasksListData: TaskList = useMemo(
    () => ({
      task_list: [{
        time_to_tasks: "",
        count_task: 0,
        task_for: "",
        title: "",
        id: 0,
        tasks: [],
      }]
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