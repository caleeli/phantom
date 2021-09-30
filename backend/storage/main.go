package storage

type Repository interface {
	GetResource(name string) (Resource, error)
}

type Resource interface {
	Get(key interface{}, out interface{}) error
	Index(filter map[string]string, out interface{}) error
	Post(record interface{}) error
	Put(key interface{}, record interface{}) error
	Delete(key interface{}) error
}

type Task struct {
	Id   interface{} `bson:"_id" json:"id,omitempty"`
	Name string      `bson:"Name"`
}

func GetResource(name string) interface{} {
	switch name {
	case "task", "tasks":
		return &Task{}
	default:
		return nil
	}
}

func GetResourceCollection(name string) interface{} {
	switch name {
	case "task", "tasks":
		tasks := []Task{}
		return &tasks
	default:
		return nil
	}
}
