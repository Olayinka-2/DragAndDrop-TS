// Project Type

enum  ProjectStatus {
  Active,
  finished
}

class Project {
  constructor(public id: string, public title: string, public description: string, public people: number, public projectStatus: ProjectStatus) {

  }
}

// Project State 
type Listener<T> = (items: T[]) => void;

class State<T> {
  protected listener: Listener<T>[] = [];

  addListener(listenerFn: Listener<T>) {
    this.listener.push(listenerFn);
  }
}

class ProjectState extends State<Project> {
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
    for(const listenerFn of this.listener) {
      listenerFn(this.projects.slice())
    }
  }
}

const projectState = ProjectState.getInstance();


// Validation function
interface Validatable {
  value: string | number;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  max?: number;
  min?: number;
}

//Component Base Class

abstract class Component<T extends HTMLElement, U extends HTMLElement> {
  templateElement: HTMLTemplateElement;
  hostElement: T;
  element: U;

  constructor(
    templateId: string,
    hostElementId: string,
    insertAtStart: boolean,
    newElementId?: string,
  ) {
    this.templateElement = document.getElementById(templateId)! as HTMLTemplateElement;
    this.hostElement = document.getElementById(hostElementId)! as T;
    const importedNode = document.importNode(this.templateElement.content, true);
    this.element = importedNode.firstElementChild as U;
    if(newElementId) {
      this.element.id = newElementId;
    }
    this.attach(insertAtStart)
  }
   private attach(insertAtBeginning: boolean) {
    this.hostElement.insertAdjacentElement(insertAtBeginning ? 'afterbegin' : 'beforeend', this.element)
  }

  abstract configure(): void;
  abstract renderContent(): void
}

// Project Item class

class ProjectItem extends Component<HTMLUListElement, HTMLLIElement> {
  private project: Project;
  constructor(hostID: string, project: Project) {
    super('single-project', hostID, false, project.id);
    this.project = project;

    this.configure();
    this.renderContent();
  }

  configure(){}
  renderContent() {
    this.element.querySelector('h2')!.textContent = this.project.title;
    this.element.querySelector('h3')!.textContent = this.project.people.toString();
    this.element.querySelector('p')!.textContent = this.project.description;
  }
}

// ProjectList class

class ProjectList extends Component<HTMLDivElement, HTMLElement> {
  assignedProject: Project[];

  constructor(private type: "active" | "finished") {
    super('project-list','app',false,`${type}-projects`);
    this.assignedProject = []

    this.configure();
    this.renderContent();
  }

  private renderProjects() {
    const listEl = document.getElementById(`${this.type}-projects-list`)! as HTMLUListElement;
    listEl.innerHTML = ""
    for(const prjItem of this.assignedProject) {
      new ProjectItem(this.element.querySelector('ul')!.id, prjItem);
    }
  }

  configure() {
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

function validate(ValidatableInput: Validatable) {
  let isValid = true;
  if(ValidatableInput.required) {
    isValid = isValid && ValidatableInput.value.toString().trim().length !== 0
  }
  if(ValidatableInput.minLength != null && typeof ValidatableInput.value === 'string') {
    isValid = isValid && ValidatableInput.value.length >= ValidatableInput.minLength;
  }
  if(ValidatableInput.maxLength != null && typeof ValidatableInput.value === 'string') {
    isValid = isValid && ValidatableInput.value.length < ValidatableInput.maxLength;
  }
  if(ValidatableInput.min != null && typeof ValidatableInput.value === 'number') {
    isValid = isValid && ValidatableInput.value > ValidatableInput.min;
  }
  if(ValidatableInput.max != null && typeof ValidatableInput.value === 'number') {
    isValid = isValid && ValidatableInput.value < ValidatableInput.max;
  } 
  return isValid;
}
// autobind decorator
function autoBind(target: any, nmethodName: string, PropertyDescriptor: PropertyDescriptor) {
  const originalMethod = PropertyDescriptor.value;
  const adjDescriptor: PropertyDescriptor = {
    configurable: true,
    get() {
      const boundFn = originalMethod.bind(this);
      return boundFn;
    }
  }
  return adjDescriptor;
}

// project input class
class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
  titleInputElement: HTMLInputElement;
  descriptionInputElement: HTMLInputElement;
  peopleInputElement: HTMLInputElement;

  constructor() {
    super('project-input', 'app', true, 'user-input');
    this.titleInputElement = this.element.querySelector('#title') as HTMLInputElement;
    this.descriptionInputElement = this.element.querySelector('#description') as HTMLInputElement;
    this.peopleInputElement = this.element.querySelector('#people') as HTMLInputElement;

    this.configure();
  }

    renderContent(): void {
    
  }

  private gatherUserInput(): [string, string, number] | void {
    const enteredTitle = this.titleInputElement.value;
    const enteredDescription = this.descriptionInputElement.value;
    const enteredPeople = this.peopleInputElement.value;

    const titleValidatable: Validatable = {
      value: enteredTitle,
      required: true
    };

    const descriptionValidatable: Validatable = {
      value: enteredDescription,
      required: true
    }

    const peopleValidatable: Validatable = {
      value: +enteredPeople,
      required: true,
      min: 1,
      max: 5
    }
 
    if(
      validate(titleValidatable) &&
      validate(descriptionValidatable) &&
      validate(peopleValidatable)
    ) {
      return [enteredTitle, enteredDescription, +enteredPeople];
    } else {
      alert('Invalid input, please try again!');
      return;
    }
  }

  private clearInputs() {
    this.titleInputElement.value = '';
    this.descriptionInputElement.value = '';
    this.peopleInputElement.value = '';
  }

  @autoBind
  private submitHandler(event: Event) {
    event.preventDefault();
    const userInput = this.gatherUserInput();
    if(Array.isArray(userInput)) {
      const [title, description, people] = userInput;
      projectState.addProjects(title, description, people)
      this.clearInputs(); 
    }
  }

  configure() {
    this.element.addEventListener('submit', this.submitHandler);
  }

}

const firstInput = new ProjectInput();
const activePrjList = new ProjectList('active');
const finishedPrjList = new ProjectList('finished');