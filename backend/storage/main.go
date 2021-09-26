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
