import { useEffect, useState } from 'react';
import { Book } from '../lib/types';
import { fetchBooks } from '../lib/api';

const useBooks = () => {
    const [books, setBooks] = useState<Book[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadBooks = async () => {
            try {
                const fetchedBooks = await fetchBooks();
                setBooks(fetchedBooks);
            } catch (err) {
                setError('Failed to load books');
            } finally {
                setLoading(false);
            }
        };

        loadBooks();
    }, []);

    return { books, loading, error };
};

export default useBooks;