package storage

type Repository interface {
	GetResource(name string) (Resource, error)
}

type Resource interface {
	Get(key string, out interface{}) error
	Index(filter map[string]string, out interface{}) error
	Post(record interface{}) error
}
