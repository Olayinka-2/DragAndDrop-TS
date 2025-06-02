import {DragTarget} from '../models/drag-drop.js';
import { Component } from './base-components.js';
import { Project, ProjectStatus } from '../models/project.js';
import { autoBind } from '../decorators/autobind.js';
import {projectState} from '../state/project-state.js';
import { ProjectItem } from './project-item.js';


export class ProjectList extends Component<HTMLDivElement, HTMLElement> implements DragTarget {
  assignedProject: Project[];

  constructor(private type: "active" | "finished") {
    super('project-list','app',false,`${type}-projects`);
    this.assignedProject = []

    this.configure();
    this.renderContent();
  }

  @autoBind
  dragOverHandler(event: DragEvent): void {
    if(event.dataTransfer && event.dataTransfer.types[0] === 'text/plain') {
      event.preventDefault();
      const listEl = this.element.querySelector('ul')!;
      listEl.classList.add('droppable');
    }
  }


  @autoBind 
  dropHandler(event: DragEvent): void {
    const prjId = event.dataTransfer!.getData('text/plain');
    projectState.moveProject(
      prjId,
      this.type === 'active' ? ProjectStatus.Active : ProjectStatus.finished
    )
  }

  @autoBind
  dragLeaveHandler(_: DragEvent): void {
    const listEl = this.element.querySelector('ul')!;
    listEl.classList.remove('droppable');
  }
  private renderProjects() {
    const listEl = document.getElementById(`${this.type}-projects-list`)! as HTMLUListElement;
    listEl.innerHTML = ""
    for(const prjItem of this.assignedProject) {
      new ProjectItem(this.element.querySelector('ul')!.id, prjItem);
    }
  }

  configure() {
    this.element.addEventListener('dragover', this.dragOverHandler);
    this.element.addEventListener('dragleave', this.dragLeaveHandler);
    this.element.addEventListener('drop', this.dropHandler);
    projectState.addListener((projects:Project[]) => {
    const relevantProjects = projects.filter(prj => {
      if(this.type === 'active') {
        return prj.projectStatus === ProjectStatus.Active
      }
      return prj.projectStatus === ProjectStatus.finished;
    })
      this.assignedProject = relevantProjects;
      this.renderProjects();
    })

  }

  renderContent() {
    const listId = `${this.type}-projects-list`;
    this.element.querySelector('ul')!.id = listId;
    this.element.querySelector('h2')!.textContent = this.type.toUpperCase() + " PROJECTS";
  }
}