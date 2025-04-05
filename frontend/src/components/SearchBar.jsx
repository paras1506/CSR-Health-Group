import { useState } from "react";
import axios from "axios";

const SearchBar = ({ setVillage }) => {
    const [query, setQuery] = useState("");
    const [suggestions, setSuggestions] = useState([]);

    const fetchSuggestions = async (val) => {
        setQuery(val);
        if (val.length > 2) {
            const { data } = await axios.get(`/solar/search?village=${val}`);
            setSuggestions(data.map((item) => item.villageName));
        } else {
            setSuggestions([]);
        }
    };

    return (
        <div className="relative">
            <input
                type="text"
                className="border p-2 w-full"
                placeholder="Search by village..."
                value={query}
                onChange={(e) => fetchSuggestions(e.target.value)}
                onBlur={() => setTimeout(() => setSuggestions([]), 200)}
            />
            <ul className="absolute bg-white border w-full">
                {suggestions.map((s, i) => (
                    <li key={i} className="p-2 hover:bg-gray-200 cursor-pointer" onClick={() => setVillage(s)}>
                        {s}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default SearchBar;
