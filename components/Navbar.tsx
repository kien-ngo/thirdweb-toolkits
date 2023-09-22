export default function Navbar() {
  return (
    <div className="navbar bg-base-100">
      <div className="flex-1">
        <a className="btn btn-ghost normal-case text-xl">thirdweb Toolkits</a>
      </div>
      <div className="flex-none">
        <ul className="menu menu-horizontal px-1">
          <li>
            <a
              href="https://github.com/kien-ngo/thirdweb-toolkits"
              target="_blank"
            >
              Github
            </a>
          </li>
          {/* <li>
            <details>
              <summary>Shortcuts</summary>
              <ul className="p-2 bg-base-100">
                <li>
                  <a>Link 1</a>
                </li>
                <li>
                  <a>Link 2</a>
                </li>
              </ul>
            </details>
          </li> */}
        </ul>
      </div>
    </div>
  );
}
