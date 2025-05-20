import re
import random
from typing import List, Dict, Tuple, Any, Set, Optional
from collections import defaultdict
try:
    from sympy import Matrix, lcm
    import numpy as np
except ImportError:
    print("Warning: Some advanced features require sympy and numpy packages")

class ChemistryQuizAlgorithm:
    """
    Chemistry Quiz Algorithm for detecting chemical concepts, equations, and definitions
    from documents and generating relevant chemistry quiz questions.
    """
    
    def __init__(self):
        """Initialize the Chemistry Quiz Algorithm."""
        # Add missing dictionaries before other initializations
        self.elements = {
            'Hydrogen': 'H', 'Helium': 'He', 'Lithium': 'Li', 'Beryllium': 'Be',
            'Boron': 'B', 'Carbon': 'C', 'Nitrogen': 'N', 'Oxygen': 'O',
            'Fluorine': 'F', 'Neon': 'Ne', 'Sodium': 'Na', 'Magnesium': 'Mg',
            'Aluminum': 'Al', 'Silicon': 'Si', 'Phosphorus': 'P', 'Sulfur': 'S',
            'Chlorine': 'Cl', 'Argon': 'Ar', 'Potassium': 'K', 'Calcium': 'Ca',
            # Add more elements as needed
        }
        
        self.element_names = {v: k for k, v in self.elements.items()}
        self.compounds = {
            'Water': 'H2O',
            'Carbon Dioxide': 'CO2',
            'Methane': 'CH4',
            'Ammonia': 'NH3',
            'Glucose': 'C6H12O6',
            'Sodium Chloride': 'NaCl',
            'Sulfuric Acid': 'H2SO4',
            'Nitric Acid': 'HNO3',
            'Hydrochloric Acid': 'HCl',
            'Sodium Hydroxide': 'NaOH',
            # Add more compounds as needed
        }
        self.compound_names = {v: k for k, v in self.compounds.items()}
        
        # Common reaction types
        self.reaction_types = {
            'synthesis': r'A \+ B → AB',
            'decomposition': r'AB → A \+ B',
            'single_displacement': r'A \+ BC → AC \+ B',
            'double_displacement': r'AB \+ CD → AD \+ CB',
            'combustion': r'CxHy \+ O2 → CO2 \+ H2O',
            'acid_base': r'HA \+ BOH → H2O \+ BA',
            'redox': r'(.*) \+ (.*) → (.*) \+ (.*)',  # Simplified pattern
        }
        
        # Common functional groups in organic chemistry
        self.functional_groups = {
            'Alcohol': '-OH',
            'Aldehyde': '-CHO',
            'Ketone': '-CO-',
            'Carboxylic Acid': '-COOH',
            'Ester': '-COO-',
            'Amine': '-NH2',
            'Amide': '-CONH2',
            'Ether': '-O-',
        }
        
        # Patterns for chemical formulas and equations
        self.formula_pattern = r'([A-Z][a-z]?\d*)+' 
        self.equation_pattern = r'.*→.*|.*->.*|.*yields.*|.*gives.*'
        self.balanced_equation_pattern = r'(\d*[A-Z][a-z]?\d*)+\s*(?:\+\s*(\d*[A-Z][a-z]?\d*)+\s*)*(?:→|->|yields|gives)\s*(\d*[A-Z][a-z]?\d*)+\s*(?:\+\s*(\d*[A-Z][a-z]?\d*)+\s*)*'
        
        # Dictionary of valencies for common elements
        self.valencies = {
            'H': 1, 'Li': 1, 'Na': 1, 'K': 1,
            'O': 2, 'S': 2, 'Ca': 2, 'Mg': 2,
            'N': 3, 'P': 3, 'Al': 3,
            'C': 4, 'Si': 4,
            'Cl': -1, 'F': -1, 'Br': -1, 'I': -1,
            # Add more as needed
        }
        
        # Dictionary of common pharmaceutical compounds
        self.pharm_compounds = {
            'Aspirin': 'C9H8O4',
            'Paracetamol': 'C8H9NO2',
            'Ibuprofen': 'C13H18O2',
            'Caffeine': 'C8H10N4O2',
            'Penicillin': 'C16H18N2O4S',
            'Morphine': 'C17H19NO3',
            # Add more pharmaceutical compounds as needed
        }
        
        self.compounds.update(self.pharm_compounds)
        
    def preprocess_text(self, text: str) -> str:
        """
        Preprocess text to normalize chemical formulas and equations.
        
        Args:
            text: Raw text from the document
            
        Returns:
            Preprocessed text
        """
        # Normalize different types of arrows to standard format
        text = re.sub(r'(-+>|yields|gives)', '→', text)
        
        # Normalize spacing around chemical formulas
        text = re.sub(r'([A-Z][a-z]?\d*)', r' \1 ', text)
        text = re.sub(r'\s+', ' ', text)
        
        # Fix common OCR errors in chemical formulas
        text = re.sub(r'l(\d)', r'1\1', text)  # Replace lowercase l with 1 in numbers
        text = re.sub(r'O(\d)', r'0\1', text)  # Replace capital O with 0 in numbers
        
        return text
    
    def extract_chemical_content(self, text: str) -> Dict[str, List[str]]:
        """
        Extract chemical formulas, equations, and concepts from text.
        
        Args:
            text: Preprocessed text from the document
            
        Returns:
            Dictionary containing lists of chemical content by category
        """
        content = {
            'formulas': [],
            'equations': [],
            'element_mentions': [],
            'compound_mentions': [],
            'concepts': []
        }
        
        # Extract chemical formulas
        formulas = set(re.findall(self.formula_pattern, text))
        for formula in formulas:
            # Verify it's likely a valid chemical formula (contains elements)
            if any(element in formula for element in self.element_names):
                content['formulas'].append(formula)
        
        # Extract chemical equations
        lines = text.split('\n')
        for line in lines:
            if re.search(self.equation_pattern, line):
                # Clean and standardize the equation
                equation = re.sub(r'\s+', ' ', line.strip())
                content['equations'].append(equation)
        
        # Extract element mentions
        for element_name, symbol in self.elements.items():
            if element_name in text or symbol in text:
                content['element_mentions'].append((element_name, symbol))
        
        # Extract compound mentions
        for compound_name, formula in self.compounds.items():
            if compound_name in text or formula in text:
                content['compound_mentions'].append((compound_name, formula))
        
        # Extract chemical concepts
        concept_patterns = [
            (r'(?:valency|valence)\s+of\s+([A-Za-z]+)', 'valency'),
            (r'(?:acid|base|pH|pOH|buffer)', 'acid_base'),
            (r'(?:oxidation|reduction|redox|electron\s+transfer)', 'redox'),
            (r'(?:bond|bonding|ionic|covalent|metallic)', 'bonding'),
            (r'(?:mole|stoichiometry|mass)', 'stoichiometry'),
            (r'(?:equilibrium|Le\s+Chatelier)', 'equilibrium'),
            (r'(?:organic|hydrocarbon|alkane|alkene|alkyne|aromatic)', 'organic'),
            (r'(?:periodic\s+table|group|period|block)', 'periodic_table'),
            (r'(?:stereochemistry|chirality|enantiomer|diastereomer)', 'stereochemistry'),
            (r'(?:pharmacokinetics|absorption|distribution|metabolism|excretion|ADME)', 'pharmacokinetics'),
            (r'(?:drug[\s-]target|receptor|binding|antagonist|agonist)', 'drug_target'),
            (r'(?:spectroscopy|NMR|IR|UV-Vis|mass[\s-]spec)', 'analytical'),
            (r'(?:enzyme|substrate|inhibition|active[\s-]site)', 'biochemistry'),
            (r'(?:drug[\s-]delivery|formulation|bioavailability|dosage)', 'pharmaceutics'),
            (r'(?:structure-activity|SAR|lead[\s-]compound|drug[\s-]design)', 'medicinal_chemistry'),
        ]
        
        for pattern, concept_type in concept_patterns:
            matches = re.finditer(pattern, text, re.IGNORECASE)
            for match in matches:
                content['concepts'].append((match.group(0), concept_type))
        
        return content
    
    def classify_reaction_type(self, equation: str) -> str:
        """Enhanced reaction classifier that handles complex cases."""
        try:
            parts = equation.split('→')
            if len(parts) != 2:
                return "unknown"
            
            reactants = [r.strip() for r in parts[0].split('+')]
            products = [p.strip() for p in parts[1].split('+')]
            
            # Parse all compounds
            reactant_elements = [self.parse_formula(r) for r in reactants]
            product_elements = [self.parse_formula(p) for p in products]
            
            # Check for organic reactions
            organic_patterns = {
                'addition': lambda r, p: any('C=C' in x for x in r) and len(p) == 1,
                'elimination': lambda r, p: len(r) == 1 and any('C=C' in x for x in p),
                'substitution': lambda r, p: any('C-X' in x for x in r) and any('C-Y' in x for x in p),
            }
            
            # Check for redox reactions
            def calc_oxidation_states(compound):
                # Complex oxidation state calculation
                states = {}
                elements = self.parse_formula(compound)
                # Implement oxidation state rules
                return states
            
            reactant_states = [calc_oxidation_states(r) for r in reactants]
            product_states = [calc_oxidation_states(p) for p in products]
            
            if any(abs(r - p) > 0 for r, p in zip(reactant_states, product_states)):
                return "redox"
                
            # Check for acid-base reactions
            acid_base_patterns = {
                'acid': r'H[A-Z]',
                'base': r'OH[-]',
                'salt': r'[A-Z][a-z]?[A-Z]'
            }
            
            if (any(re.search(acid_base_patterns['acid'], r) for r in reactants) and
                any(re.search(acid_base_patterns['base'], r) for r in reactants) and
                any(re.search(acid_base_patterns['salt'], p) for p in products)):
                return "acid_base"
                
            # Enhanced combustion check
            if ('O2' in reactants and 
                all(e in ['CO2', 'H2O', 'SO2', 'NO2'] for e in products)):
                return "combustion"
                
            # More specific displacement checks
            def is_displacement(r_elements, p_elements):
                # Implement detailed displacement logic
                pass
                
            if len(reactants) == 2 and len(products) == 2:
                if is_displacement(reactant_elements, product_elements):
                    return "single_displacement"
                    
            return "unknown"
            
        except Exception as e:
            print(f"Failed to classify reaction: {str(e)}")
            return "unknown"
        
    def parse_formula(self, formula: str) -> Dict[str, int]:
        """Enhanced formula parser that handles complex compounds."""
        elements = {}
        
        def process_substring(substr: str, multiplier: int = 1) -> None:
            nonlocal elements  # Add this to access outer elements dict
            i = 0
            while i < len(substr):
                if substr[i] == '(':
                    # Find matching closing parenthesis
                    level = 1
                    j = i + 1
                    while j < len(substr) and level > 0:
                        if substr[j] == '(': level += 1
                        if substr[j] == ')': level -= 1
                        j += 1
                    
                    # Get multiplier after parentheses
                    k = j
                    while k < len(substr) and substr[k].isdigit():
                        k += 1
                    
                    inner_multiplier = int(substr[j:k]) if k > j else 1
                    process_substring(substr[i+1:j-1], multiplier * inner_multiplier)
                    i = k
                elif substr[i].isupper():
                    # Handle element symbol
                    symbol = substr[i]
                    i += 1
                    if i < len(substr) and substr[i].islower():
                        symbol += substr[i]
                        i += 1
                    
                    # Get count
                    count = ''
                    while i < len(substr) and substr[i].isdigit():
                        count += substr[i]
                        i += 1
                    
                    count = int(count) if count else 1
                    elements[symbol] = elements.get(symbol, 0) + (count * multiplier)
                else:
                    i += 1
    
        process_substring(formula)
        return elements
    
    def balance_equation(self, equation: str) -> str:
        """Enhanced equation balancer using matrix algebra."""
        try:
            # Split and clean equation
            reactants, products = equation.split('→')
            reactants = [r.strip() for r in reactants.split('+')]
            products = [p.strip() for p in products.split('+')]
            
            # Get all unique elements
            all_elements = set()
            for compound in reactants + products:
                all_elements.update(self.parse_formula(compound).keys())
            all_elements = sorted(list(all_elements))
            
            # Build coefficient matrix
            num_compounds = len(reactants) + len(products)
            matrix = []
            
            # For each element, create equation row
            for element in all_elements:
                row = []
                # Add reactant coefficients
                for compound in reactants:
                    elements = self.parse_formula(compound)
                    row.append(elements.get(element, 0))
                # Add product coefficients (negative)
                for compound in products:
                    elements = self.parse_formula(compound)
                    row.append(-elements.get(element, 0))
                matrix.append(row)
            
            # Convert to SymPy matrix and solve
            matrix = Matrix(matrix)
            solution = matrix.nullspace()[0]
            
            # Convert to integers
            coeffs = [int(sol) for sol in solution]
            # Find least common multiple to make all coefficients integers
            lcm_value = lcm(*[c.denominator for c in solution])
            coeffs = [int(c * lcm_value) for c in coeffs]
            
            # Build balanced equation
            balanced_reactants = []
            balanced_products = []
            
            for i, compound in enumerate(reactants):
                coeff = coeffs[i]
                if coeff > 1:
                    balanced_reactants.append(f"{coeff} {compound}")
                else:
                    balanced_reactants.append(compound)
                    
            for i, compound in enumerate(products):
                coeff = abs(coeffs[i + len(reactants)])
                if coeff > 1:
                    balanced_products.append(f"{coeff} {compound}")
                else:
                    balanced_products.append(compound)
            
            return f"{' + '.join(balanced_reactants)} → {' + '.join(balanced_products)}"
            
        except Exception as e:
            print(f"Failed to balance equation: {str(e)}")
            return equation
    
    def generate_questions(self, content: Dict[str, List[Any]], num_questions: int = 20) -> List[Dict[str, Any]]:
        """
        Generate chemistry quiz questions from extracted content.
        
        Args:
            content: Dictionary of extracted chemical content
            num_questions: Maximum number of questions to generate
            
        Returns:
            List of generated questions
        """
        questions = []
        
        # Generate formula questions
        questions.extend(self._generate_formula_questions(content))
        
        # Generate equation questions
        questions.extend(self._generate_equation_questions(content))
        
        # Generate element property questions
        questions.extend(self._generate_element_questions(content))
        
        # Generate concept questions
        questions.extend(self._generate_concept_questions(content))
        
        # Generate molecular structure questions if formulas are available
        if content['formulas']:
            questions.extend(self._generate_structure_questions(content))
        
        # Generate nomenclature practice questions
        questions.extend(self._generate_nomenclature_questions(content))

         # Generate pharmacy-related questions
        questions.extend(self._generate_pharmacy_questions(content))
        
        # Ensure we have at least some questions
        while len(questions) < min(5, num_questions) and len(content['formulas']) > 0:
            formula = random.choice(content['formulas'])
            questions.append({
                'question_type': 'short_answer',
                'question': f"Write the chemical formula for {self.get_compound_name(formula)}.",
                'answer': formula,
                'difficulty': 'easy'
            })
        
        # Sort questions by difficulty (easy to hard)
        difficulty_values = {'easy': 0, 'medium': 1, 'hard': 2}
        questions = sorted(questions, key=lambda q: difficulty_values.get(q.get('difficulty', 'medium'), 1))
        
        # Return the requested number of questions, ensuring diversity in question types
        return self._ensure_diversity(questions, num_questions)
    
    def _generate_formula_questions(self, content: Dict[str, List[Any]]) -> List[Dict[str, Any]]:
        """Generate questions related to chemical formulas."""
        questions = []
        
        # Formula identification questions
        for compound_name, formula in self.compounds.items():
            if formula in content['formulas'] or (compound_name, formula) in content['compound_mentions']:
                # Formula from name
                questions.append({
                    'question_type': 'short_answer',
                    'question': f"What is the chemical formula for {compound_name}?",
                    'answer': formula,
                    'difficulty': 'easy'
                })
                
                # Name from formula (multiple choice)
                options = [compound_name]
                other_compounds = list(self.compounds.keys())
                other_compounds.remove(compound_name)
                options.extend(random.sample(other_compounds, min(3, len(other_compounds))))
                random.shuffle(options)
                
                questions.append({
                    'question_type': 'multiple_choice',
                    'question': f"What is the name of the compound with the formula {formula}?",
                    'options': options,
                    'answer': compound_name,
                    'difficulty': 'easy'
                })
        
        # Element count questions
        for formula in content['formulas']:
            try:
                elements = self.parse_formula(formula)
                if len(elements) >= 2:
                    element = random.choice(list(elements.keys()))
                    count = elements[element]
                    
                    questions.append({
                        'question_type': 'short_answer',
                        'question': f"How many atoms of {self.element_names.get(element, element)} are in one molecule of {formula}?",
                        'answer': str(count),
                        'difficulty': 'medium'
                    })
            except:
                continue
                
        return questions
        
    def _generate_equation_questions(self, content: Dict[str, List[Any]]) -> List[Dict[str, Any]]:
        """Generate questions related to chemical equations."""
        questions = []
        
        for equation in content['equations']:
            # Classify the reaction type
            reaction_type = self.classify_reaction_type(equation)
            
            if reaction_type != "unknown":
                # Question about reaction type
                questions.append({
                    'question_type': 'multiple_choice',
                    'question': f"What type of reaction is represented by the equation: {equation}?",
                    'options': ["Synthesis", "Decomposition", "Single Displacement", "Double Displacement", "Combustion"],
                    'answer': reaction_type.replace('_', ' ').title(),
                    'difficulty': 'medium'
                })
            
            # Equation balancing questions
            # Only try to create balance questions for unbalanced equations
            if not re.search(r'^\d+\s*[A-Z]', equation):  # Check if equation starts with a coefficient
                balanced = self.balance_equation(equation)
                if balanced != equation:
                    questions.append({
                        'question_type': 'short_answer',
                        'question': f"Balance the following chemical equation: {equation}",
                        'answer': balanced,
                        'difficulty': 'hard'
                    })
            
            # Identify products/reactants
            parts = equation.split('→')
            if len(parts) == 2:
                reactants = parts[0].strip()
                products = parts[1].strip()
                
                questions.append({
                    'question_type': 'short_answer',
                    'question': f"In the equation {equation}, what are the reactants?",
                    'answer': reactants,
                    'difficulty': 'easy'
                })
                
                questions.append({
                    'question_type': 'short_answer',
                    'question': f"In the equation {equation}, what are the products?",
                    'answer': products,
                    'difficulty': 'easy'
                })
        
        return questions
    
    def _generate_element_questions(self, content: Dict[str, List[Any]]) -> List[Dict[str, Any]]:
        """Generate questions about element properties."""
        questions = []
        
        for element_name, symbol in content['element_mentions']:
            # Symbol questions
            questions.append({
                'question_type': 'short_answer',
                'question': f"What is the chemical symbol for {element_name}?",
                'answer': symbol,
                'difficulty': 'easy'
            })
            
            # Valency questions if available
            if symbol in self.valencies:
                questions.append({
                    'question_type': 'short_answer',
                    'question': f"What is the valency of {element_name}?",
                    'answer': str(self.valencies[symbol]),
                    'difficulty': 'medium'
                })
                
            # Periodic table position questions (for common elements)
            periodic_table_info = {
                'H': {'group': 1, 'period': 1, 'block': 's'},
                'He': {'group': 18, 'period': 1, 'block': 'p'},
                'Li': {'group': 1, 'period': 2, 'block': 's'},
                'C': {'group': 14, 'period': 2, 'block': 'p'},
                'N': {'group': 15, 'period': 2, 'block': 'p'},
                'O': {'group': 16, 'period': 2, 'block': 'p'},
                'Na': {'group': 1, 'period': 3, 'block': 's'},
                'Cl': {'group': 17, 'period': 3, 'block': 'p'},
                # Add more as needed
            }
            
            if symbol in periodic_table_info:
                info = periodic_table_info[symbol]
                
                questions.append({
                    'question_type': 'multiple_choice',
                    'question': f"In which group of the periodic table is {element_name} located?",
                    'options': [str(info['group']), str((info['group'] + 2) % 18 + 1), str((info['group'] + 5) % 18 + 1), str((info['group'] + 8) % 18 + 1)],
                    'answer': str(info['group']),
                    'difficulty': 'medium'
                })
                
                questions.append({
                    'question_type': 'multiple_choice',
                    'question': f"In which period of the periodic table is {element_name} located?",
                    'options': [str(info['period']), str((info['period'] + 1) % 7 + 1), str((info['period'] + 2) % 7 + 1), str((info['period'] + 3) % 7 + 1)],
                    'answer': str(info['period']),
                    'difficulty': 'medium'
                })
                
                questions.append({
                    'question_type': 'multiple_choice',
                    'question': f"To which block of the periodic table does {element_name} belong?",
                    'options': ['s', 'p', 'd', 'f'],
                    'answer': info['block'],
                    'difficulty': 'hard'
                })
        
        return questions
    
    def _generate_concept_questions(self, content: Dict[str, List[Any]]) -> List[Dict[str, Any]]:
        """Generate questions about chemical concepts."""
        questions = []
        
        for concept_text, concept_type in content['concepts']:
            if concept_type == 'acid_base':
                questions.append({
                    'question_type': 'true_false',
                    'question': "True or False: According to the Arrhenius definition, acids donate protons (H+) in aqueous solutions.",
                    'answer': True,
                    'difficulty': 'medium'
                })
                
                questions.append({
                    'question_type': 'multiple_choice',
                    'question': "Which of the following is an acid according to the Brønsted-Lowry definition?",
                    'options': ["Proton donor", "Proton acceptor", "Electron donor", "Electron acceptor"],
                    'answer': "Proton donor",
                    'difficulty': 'medium'
                })
                
            elif concept_type == 'redox':
                questions.append({
                    'question_type': 'multiple_choice',
                    'question': "In a redox reaction, what happens to the element being oxidized?",
                    'options': [
                        "It loses electrons", 
                        "It gains electrons", 
                        "Its oxidation number decreases", 
                        "It becomes more electronegative"
                    ],
                    'answer': "It loses electrons",
                    'difficulty': 'medium'
                })
                
            elif concept_type == 'bonding':
                questions.append({
                    'question_type': 'multiple_choice',
                    'question': "Which type of bonding occurs between atoms with large differences in electronegativity?",
                    'options': ["Ionic", "Covalent", "Metallic", "Hydrogen"],
                    'answer': "Ionic",
                    'difficulty': 'medium'
                })
                
            elif concept_type == 'periodic_table':
                questions.append({
                    'question_type': 'multiple_choice',
                    'question': "As you move from left to right across a period in the periodic table, what generally happens to atomic radius?",
                    'options': [
                        "It decreases", 
                        "It increases", 
                        "It remains constant", 
                        "It increases then decreases"
                    ],
                    'answer': "It decreases",
                    'difficulty': 'hard'
                })
        
        return questions
    
    def _generate_structure_questions(self, content: Dict[str, List[Any]]) -> List[Dict[str, Any]]:
        """Generate questions about molecular structures."""
        questions = []
        
        # Dictionary of common molecular geometries
        molecular_geometries = {
            'H2O': 'bent',
            'NH3': 'trigonal pyramidal',
            'CH4': 'tetrahedral',
            'CO2': 'linear',
            'BF3': 'trigonal planar',
            'SF6': 'octahedral',
            'PCl5': 'trigonal bipyramidal'
        }
        
        for formula in content['formulas']:
            if formula in molecular_geometries:
                geometry = molecular_geometries[formula]
                
                questions.append({
                    'question_type': 'multiple_choice',
                    'question': f"What is the molecular geometry of {formula}?",
                    'options': ['linear', 'bent', 'trigonal planar', 'tetrahedral', 'trigonal pyramidal', 'octahedral'],
                    'answer': geometry,
                    'difficulty': 'hard'
                })
                
                # Hybridization questions for common molecules
                hybridization_info = {
                    'H2O': 'sp3', 'NH3': 'sp3', 'CH4': 'sp3',
                    'CO2': 'sp', 'BF3': 'sp2', 'C2H4': 'sp2'
                }
                
                if formula in hybridization_info:
                    questions.append({
                        'question_type': 'multiple_choice',
                        'question': f"What is the hybridization of the central atom in {formula}?",
                        'options': ['sp', 'sp2', 'sp3', 'sp3d', 'sp3d2'],
                        'answer': hybridization_info[formula],
                        'difficulty': 'hard'
                    })
        
        return questions
    
    def _generate_nomenclature_questions(self, content: Dict[str, List[Any]]) -> List[Dict[str, Any]]:
        """Generate nomenclature practice questions."""
        questions = []
        
        # IUPAC naming for common compounds
        iupac_names = {
        'CH4': 'methane',
        'C2H6': 'ethane',
        'C3H8': 'propane',
        'C2H5OH': 'ethanol',
        'CH3COOH': 'acetic acid',
        'CH3CHO': 'acetaldehyde',
        'CH3COCH3': 'acetone',
        'CH3NH2': 'methylamine',
        'C2H4': 'ethene',
        'C3H6': 'propene',
        'C4H10': 'butane',
        'C5H12': 'pentane',
        'C6H14': 'hexane',
        'C7H16': 'heptane',
        'C8H18': 'octane',
        'C9H20': 'nonane',
        'C10H22': 'decane',
        'H2O': 'water',
        'CO2': 'carbon dioxide',
        'CO': 'carbon monoxide',
        'O2': 'dioxygen',
        'N2': 'dinitrogen',
        'NH3': 'ammonia',
        'H2O2': 'hydrogen peroxide',
        'HCl': 'hydrogen chloride',
        'NaCl': 'sodium chloride',
        'KCl': 'potassium chloride',
        'NaOH': 'sodium hydroxide',
        'KOH': 'potassium hydroxide',
        'H2SO4': 'sulfuric acid',
        'HNO3': 'nitric acid',
        'H3PO4': 'phosphoric acid',
        'H2CO3': 'carbonic acid',
        'NaHCO3': 'sodium bicarbonate',
        'CaCO3': 'calcium carbonate',
        'Na2CO3': 'sodium carbonate',
        'MgSO4': 'magnesium sulfate',
        'CaSO4': 'calcium sulfate',
        'Fe2O3': 'iron(III) oxide',
        'FeO': 'iron(II) oxide',
        'Al2O3': 'aluminum oxide',
        'SiO2': 'silicon dioxide',
        'CH2Cl2': 'dichloromethane',
        'CHCl3': 'chloroform',
        'CCl4': 'carbon tetrachloride',
        'C6H6': 'benzene',
        'C6H5OH': 'phenol',
        'C6H5NH2': 'aniline',
        'C6H5CHO': 'benzaldehyde',
        'C6H5COOH': 'benzoic acid',
        'CH3OCH3': 'dimethyl ether',
        'C2H5OCH3': 'methoxyethane',
        'CH3CN': 'acetonitrile',
        'C2H2': 'ethyne',
        'C3H4': 'propyne',
        'C2H5Cl': 'chloroethane',
        'C3H7OH': 'propanol',
        'C4H9OH': 'butanol'
    }

        
        for formula in content['formulas']:
            if formula in iupac_names:
                iupac_name = iupac_names[formula]
                
                questions.append({
                    'question_type': 'short_answer',
                    'question': f"What is the IUPAC name for the compound with formula {formula}?",
                    'answer': iupac_name,
                    'difficulty': 'medium'
                })
                
                questions.append({
                    'question_type': 'short_answer',
                    'question': f"Write the chemical formula for {iupac_name}.",
                    'answer': formula,
                    'difficulty': 'medium'
                })
        
        # Salt naming questions
        salt_names = {
            'NaCl': 'sodium chloride',
            'KBr': 'potassium bromide',
            'CaCO3': 'calcium carbonate',
            'MgSO4': 'magnesium sulfate',
            'NH4NO3': 'ammonium nitrate'
        }
        
        for formula in content['formulas']:
            if formula in salt_names:
                salt_name = salt_names[formula]
                
                questions.append({
                    'question_type': 'short_answer',
                    'question': f"What is the name of the ionic compound {formula}?",
                    'answer': salt_name,
                    'difficulty': 'easy'
                })
        
        return questions
    
    def _ensure_diversity(self, questions: List[Dict[str, Any]], num_questions: int) -> List[Dict[str, Any]]:
        """Ensure diversity in question types and topics."""
        # Group questions by type
        questions_by_type = defaultdict(list)
        for question in questions:
            questions_by_type[question['question_type']].append(question)
        
        # Create a diverse set of questions
        diverse_questions = []
        
        # Calculate how many questions of each type to include
        question_types = list(questions_by_type.keys())
        questions_per_type = max(1, num_questions // len(question_types))
        
        # Add questions of each type
        for q_type in question_types:
            type_questions = questions_by_type[q_type]
            diverse_questions.extend(type_questions[:questions_per_type])
        
        # Fill remaining slots with high-difficulty questions
        remaining_slots = num_questions - len(diverse_questions)
        if remaining_slots > 0:
            # Find all remaining questions
            used_questions = set(q['question'] for q in diverse_questions)
            remaining_questions = [q for q in questions if q['question'] not in used_questions]
            
            # Sort by difficulty (prioritize harder questions)
            difficulty_values = {'easy': 0, 'medium': 1, 'hard': 2}
            remaining_questions.sort(key=lambda q: difficulty_values.get(q.get('difficulty', 'medium'), 1), reverse=True)
            
            diverse_questions.extend(remaining_questions[:remaining_slots])
        
        return diverse_questions[:num_questions]
    
    def get_compound_name(self, formula: str) -> str:
        """Get the name of a compound from its formula."""
        if formula in self.compound_names:
            return self.compound_names[formula]
        else:
            return f"the compound with the formula {formula}"
    
    def process_document(self, document_text: str, num_questions: int = 20) -> List[Dict[str, Any]]:
        """
        Process a document and generate chemistry quiz questions.
        
        Args:
            document_text: The raw text extracted from the document
            num_questions: Maximum number of questions to generate
            
        Returns:
            List of generated questions
        """
        # Preprocess the document text
        preprocessed_text = self.preprocess_text(document_text)
        
        # Extract chemical content
        content = self.extract_chemical_content(preprocessed_text)
        
        # Generate questions from the extracted content
        questions = self.generate_questions(content, num_questions)
        
        return questions
    
    def _generate_pharmacy_questions(self, content: Dict[str, List[Any]]) -> List[Dict[str, Any]]:
        """Generate pharmacy-related chemistry questions."""
        questions = []
        
        # Dictionary of pharmacy-specific concepts
        pharm_concepts = {
            'stereochemistry': [
                {
                    'question': "What is the significance of chirality in drug action?",
                    'options': [
                        "Different enantiomers can have different biological effects",
                        "Chiral drugs are always more potent",
                        "Stereochemistry has no effect on drug action",
                        "All drug molecules must be chiral"
                    ],
                    'answer': "Different enantiomers can have different biological effects"
                }
            ],
            'pharmacokinetics': [
                {
                    'question': "What does ADME stand for in pharmacokinetics?",
                    'answer': "Absorption, Distribution, Metabolism, Excretion",
                    'difficulty': 'medium'
                }
            ],
            'drug_target': [
                {
                    'question': "What is the difference between an agonist and an antagonist?",
                    'answer': "An agonist activates a receptor while an antagonist blocks or reduces receptor activity",
                    'difficulty': 'medium'
                }
            ]
        }
        
        # Generate questions based on detected concepts
        for concept_text, concept_type in content['concepts']:
            if concept_type in pharm_concepts:
                for q in pharm_concepts[concept_type]:
                    if 'options' in q:
                        questions.append({
                            'question_type': 'multiple_choice',
                            'question': q['question'],
                            'options': q['options'],
                            'answer': q['answer'],
                            'difficulty': q.get('difficulty', 'medium')
                        })
                    else:
                        questions.append({
                            'question_type': 'short_answer',
                            'question': q['question'],
                            'answer': q['answer'],
                            'difficulty': q.get('difficulty', 'medium')
                        })
        
        return questions
    


    def calculate_electron_domains(self, formula: str) -> Dict[str, Any]:
        """Calculate electron domains and geometry using VSEPR theory."""
        electron_domains = {
            'central_atom': None,
            'surrounding_atoms': [],
            'geometry': None,
            'bond_angle': None,
            'lone_pairs': 0
        }
        
        try:
            # Parse molecular structure
            elements = self.parse_formula(formula)
            
            # Determine central atom and surrounding atoms
            central_atom = max(elements, key=elements.get)
            surrounding_atoms = [atom for atom in elements if atom != central_atom]
            
            electron_domains['central_atom'] = central_atom
            electron_domains['surrounding_atoms'] = surrounding_atoms
            
            # Calculate geometry and bond angles using VSEPR theory rules
            def determine_geometry(central_atom, surrounding_atoms):
                # Implement VSEPR theory rules
                pass
            
            return electron_domains
        
        except Exception as e:
            print(f"Failed to calculate electron domains: {str(e)}")
            return electron_domains



    def analyze_structure(self, formula: str) -> Dict[str, Any]:
        """Analyze molecular structure and properties."""
        structure_info = {
            'geometry': None,
            'hybridization': {},
            'bond_types': [],
            'functional_groups': [],
            'chirality': False,
            'resonance': False
        }
        
        try:
            # Parse molecular structure
            elements = self.parse_formula(formula)
            
            # Determine electron domains and geometry
            def calculate_electron_domains(central_atom, surrounding_atoms):
                # Implement VSEPR theory rules
                pass
                
            # Check for functional groups
            functional_group_patterns = {
                'alcohol': r'COH$',
                'carboxyl': r'COOH',
                'amine': r'CN?H2',
                'amide': r'CONH2?',
                'ester': r'COO[A-Z]',
                # Add more patterns
            }
            
            # Analyze hybridization
            def determine_hybridization(atom, bonds):
                # Implement hybridization rules
                pass
                
            # Check for chirality
            def has_chiral_center(formula):
                # Implement chirality detection
                pass
                
            # Analyze resonance
            def has_resonance(formula):
                # Implement resonance detection
                pass
            
            return structure_info
            
        except Exception as e:
            print(f"Failed to analyze structure: {str(e)}")
            return structure_info

