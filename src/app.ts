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
type Listener = (items: Project[]) => void;

class ProjectState {
  private listeners: Listener[] = [];
  private projects: Project[] = [];
  private static instance: ProjectState

  private constructor() {

  }

  static getInstance() {
    if(this.instance) {
      return this.instance;
    }
    this.instance = new ProjectState();
    return this.instance;
  }

  addListener(listenerFn: Listener) {
    this.listeners.push(listenerFn);
  }

  addProjects(title: string, description: string, numOfPeople: number) {
    const newProjects = new Project(
      Math.random().toString(),
      title, description, 
      numOfPeople, 
      ProjectStatus.Active
    )
    this.projects.push(newProjects);
    for(const listenerFn of this.listeners) {
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

// ProjectList class

class ProjectList {
  templateElement: HTMLTemplateElement;
  hostElement: HTMLDivElement;
  element: HTMLElement;
  assignedProject: Project[];

  constructor(private type: "active" | "finished") {
  this.templateElement = document.getElementById('project-list')! as HTMLTemplateElement;
    this.hostElement = document.getElementById('app')! as HTMLDivElement;
    this.assignedProject = []

    const importedNode = document.importNode(this.templateElement.content, true);
    this.element = importedNode.firstElementChild as HTMLElement;
    this.element.id = `${this.type}-projects`;

    projectState.addListener((projects:Project[]) => {
    const relevantProjects = projects.filter(prj => {
      prj.projectStatus === ProjectStatus.Active
    })
      this.assignedProject = projects;
      this.renderProjects();
    })

    this.attach();
    this.renderContent();
  }

  private renderProjects() {
    const listEl = document.getElementById(`${this.type}-projects-list`)! as HTMLUListElement;
    for(const prjItem of this.assignedProject) {
      const listItem = document.createElement('li');
      listItem.textContent = prjItem.title;
      listEl.appendChild(listItem)
    }
  }

  private renderContent() {
    const listId = `${this.type}-projects-list`;
    this.element.querySelector('ul')!.id = listId;
    this.element.querySelector('h2')!.textContent = this.type.toUpperCase() + " PROJECTS";
  }

  private attach() {
    this.hostElement.insertAdjacentElement('beforeend', this.element)
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
class ProjectInput {
  templateElement: HTMLTemplateElement;
  hostElement: HTMLDivElement;
  element: HTMLFormElement;
  titleInputElement: HTMLInputElement;
  descriptionInputElement: HTMLInputElement;
  peopleInputElement: HTMLInputElement;

  constructor() {
    this.templateElement = document.getElementById('project-input')! as HTMLTemplateElement;
    this.hostElement = document.getElementById('app')! as HTMLDivElement;

    const importedNode = document.importNode(this.templateElement.content, true);
    this.element = importedNode.firstElementChild as HTMLFormElement;
    this.element.id = 'user-input';

    this.titleInputElement = this.element.querySelector('#title') as HTMLInputElement;
    this.descriptionInputElement = this.element.querySelector('#description') as HTMLInputElement;
    this.peopleInputElement = this.element.querySelector('#people') as HTMLInputElement;

    this.configure();
    this.attach();
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

  private configure() {
    this.element.addEventListener('submit', this.submitHandler);
  }

  private attach() {
    this.hostElement.insertAdjacentElement('afterbegin', this.element);
  }
}

const firstInput = new ProjectInput();
const activePrjList = new ProjectList('active');
const finishedPrjList = new ProjectList('finished');