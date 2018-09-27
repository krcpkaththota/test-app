import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
// import './test.css';
import App from './components/App';
import Javascript from './components/Javascript';
import Python from './components/Python';
import Php from './components/Php';
import { BrowserRouter as Router, Route, Link, NavLink } from 'react-router-dom';
import { Navbar, Nav, NavItem } from 'react-bootstrap';
import registerServiceWorker from './registerServiceWorker';


const Root = () => 
	<Router>
		<div>
			<Navbar>
				<Navbar.Header>
					<Navbar.Brand>
						<Link to="/">NEWSAPP</Link>
					</Navbar.Brand>

					<Navbar.Toggle />
				</Navbar.Header>
				<Navbar.Collapse>
					<Nav>
						<NavItem>
							<NavLink exact to="/" activeClassName="active">Home</NavLink>
						</NavItem>
						<NavItem>
							<NavLink to="/javascript" activeClassName="active">Javascript</NavLink>
						</NavItem>
						<NavItem>
							<NavLink to="/python" activeClassName="active">Python</NavLink>
						</NavItem>
						<NavItem>
							<NavLink to="/php" activeClassName="active">Php</NavLink>
						</NavItem>
					</Nav>	
				</Navbar.Collapse>			
			</Navbar>
			

			<Route exact path="/" component={ App } />
			<Route exact path="/javascript" component={ Javascript }/>
			<Route exact path="/python" component={ Python }/>
			<Route exact path="/php" component={ Php }/>
		</div>
	</Router>

ReactDOM.render(<Root />, document.getElementById('root'));
registerServiceWorker();