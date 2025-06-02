import { Project, ProjectStatus } from "../models/project.js";


type Listener<T> = (items: T[]) => void;

class State<T> {
  protected listener: Listener<T>[] = [];

  addListener(listenerFn: Listener<T>) {
    this.listener.push(listenerFn);
  }
}

export class ProjectState extends State<Project> {
  private projects: Project[] = [];
  private static instance: ProjectState

  private constructor() {
    super()
  }

  static getInstance() {
    if(this.instance) {
      return this.instance;
    }
    this.instance = new ProjectState();
    return this.instance;
  }

  addProjects(title: string, description: string, numOfPeople: number) {
    const newProjects = new Project(
      Math.random().toString(),
      title, description, 
      numOfPeople, 
      ProjectStatus.Active
    )
    this.projects.push(newProjects);
    this.updateListeners();
  }

  moveProject(projectId: string, newStatus: ProjectStatus) {
    const project = this.projects.find(prj => prj.id === projectId);
    if(project && project.projectStatus !== newStatus) {
      project.projectStatus = newStatus;
      this.updateListeners();
    }
  }

  private updateListeners() {
    for(const listenerFn of this.listener) {
      listenerFn(this.projects.slice());
    }
  }
}

export const projectState = ProjectState.getInstance();
