import { deleteItem } from '../api';
export default function ItemList({ items, onRefresh }) {
const handleDelete = async (id) => {await deleteItem(id);
onRefresh();
};
return (
<div>
<h2>Items</h2>
{items.map(item => (
<div key={item._id} style={{ border: '1px solid #ccc', padding: '1rem', marginBottom: '1rem' }}>
<h3>{item.name}</h3>
<p>{item.description}</p>
<p>Price: ${item.price.toFixed(2)}</p>
<button onClick={() => handleDelete(item._id)}>Delete</button>
</div>
))}
</div>
);
}