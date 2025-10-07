
import './Navbar.css'
import profileIcon from '../../assets/profile_icon.png'

const Navbar = () => {
  return (
    <div className='navbar'>
      <img src="" alt="" className="logo" />
      <ul>
        <li><a href="#">Home</a></li>
        <li><a href="#">Discovery</a></li>
        <li><a href="#">My events</a></li>
        <li><a href="#">About us</a></li>
        {/* Profile image (no hover effect) */}
        <li className="profile-icon">
          <img src={profileIcon} alt="Profile" />
        </li>
      </ul>
    </div>
  )
}

export default Navbar
// git add .
// git commit -m "blah blah blah"
// git push origin navbar
