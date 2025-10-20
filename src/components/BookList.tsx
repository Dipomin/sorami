import React from 'react';
import { Book } from '../lib/types'; // Assurez-vous que le type Book est défini dans types.ts

interface BookListProps {
    books: Book[];
}

const BookList: React.FC<BookListProps> = ({ books }) => {
    return (
        <div className="book-list">
            <h2 className="text-2xl font-bold mb-4">Liste des Livres</h2>
            <ul>
                {books.map((book) => (
                    <li key={book.id} className="mb-2">
                        <div className="p-4 border rounded shadow">
                            <h3 className="text-xl font-semibold">{book.title}</h3>
                            <p>{book.description}</p>
                            <a href={`/books/${book.id}`} className="text-blue-500 hover:underline">
                                Voir les détails
                            </a>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default BookList;