/* ============================================================
   starmap.js — SVG 互動星圖與跳躍航行(M2)
   - 目前星系高亮;相鄰且未鎖定的星系可跳躍(消耗燃料)
   - 鎖定星系顯示原因;travel 權限由目前節點的 travel:true 決定
   ============================================================ */
(function () {
    "use strict";

    const Starmap = {
        _canTravel: false,

        canTravelHere() {
            const s = SE.State.data;
            const node = s && s.node && SE.DATA.nodes[s.node];
            return !!(node && node.travel);
        },

        open(forceView) {
            Starmap._canTravel = forceView === true ? false : Starmap.canTravelHere();
            Starmap.render();
            SE.UI.openModal("modal-starmap");
        },

        isLocked(id) {
            const sys = SE.DATA.systems[id];
            return !!(sys.locked && SE.State.data.unlocked.indexOf(id) === -1);
        },

        render() {
            const s = SE.State.data;
            const cur = s.ship.system;
            const curSys = SE.DATA.systems[cur];
            const NS = "http://www.w3.org/2000/svg";
            const svg = document.getElementById("starmap-svg");
            svg.innerHTML = "";

            /* 航線 */
            const drawn = {};
            Object.keys(SE.DATA.systems).forEach(function (id) {
                const sys = SE.DATA.systems[id];
                Object.keys(sys.lanes || {}).forEach(function (to) {
                    const key = [id, to].sort().join("|");
                    if (drawn[key] || !SE.DATA.systems[to]) return;
                    drawn[key] = true;
                    const line = document.createElementNS(NS, "line");
                    line.setAttribute("x1", sys.pos[0]); line.setAttribute("y1", sys.pos[1]);
                    line.setAttribute("x2", SE.DATA.systems[to].pos[0]); line.setAttribute("y2", SE.DATA.systems[to].pos[1]);
                    const active = (id === cur || to === cur) &&
                        !Starmap.isLocked(id) && !Starmap.isLocked(to);
                    line.setAttribute("class", "sm-lane" + (active ? " active" : ""));
                    svg.appendChild(line);
                });
            });

            /* 星系節點 */
            Object.keys(SE.DATA.systems).forEach(function (id) {
                const sys = SE.DATA.systems[id];
                const g = document.createElementNS(NS, "g");
                const isCur = id === cur;
                const locked = Starmap.isLocked(id);
                const adjacent = !!(curSys.lanes && curSys.lanes[id] != null);
                const cost = adjacent ? curSys.lanes[id] : null;
                const reachable = Starmap._canTravel && adjacent && !locked && !isCur;
                const affordable = reachable && s.ship.fuel >= cost;

                g.setAttribute("class", "sm-node" +
                    (isCur ? " current" : "") +
                    (locked ? " locked" : "") +
                    (affordable ? " reachable" : ""));

                const c = document.createElementNS(NS, "circle");
                c.setAttribute("cx", sys.pos[0]); c.setAttribute("cy", sys.pos[1]);
                c.setAttribute("r", isCur ? 11 : 8);
                g.appendChild(c);

                const label = document.createElementNS(NS, "text");
                label.setAttribute("x", sys.pos[0]); label.setAttribute("y", sys.pos[1] - 16);
                label.textContent = (locked ? "🔒" : "") + sys.name;
                g.appendChild(label);

                const sub = document.createElementNS(NS, "text");
                sub.setAttribute("class", "sm-sub");
                sub.setAttribute("x", sys.pos[0]); sub.setAttribute("y", sys.pos[1] + 24);
                sub.textContent = isCur ? "目前位置" :
                    locked ? sys.blurb :
                    adjacent ? "燃料 " + cost + ((Starmap._canTravel && s.ship.fuel < cost) ? "(不足)" : "") : "";
                g.appendChild(sub);

                if (affordable) {
                    g.style.cursor = "pointer";
                    g.addEventListener("click", function () { Starmap.travel(id); });
                }
                svg.appendChild(g);
            });

            document.getElementById("starmap-fuel").textContent =
                "燃料:" + s.ship.fuel + " / " + s.ship.fuelMax +
                (Starmap._canTravel ? "" : "　(目前無法啟航——請先回到迴響號)");
        },

        travel(toId) {
            const s = SE.State.data;
            const cost = SE.DATA.systems[s.ship.system].lanes[toId];
            if (s.ship.fuel < cost) return;
            s.ship.fuel -= cost;
            s.ship.system = toId;
            SE.UI.closeModal("modal-starmap");
            SE.UI.toast("躍遷完成:" + SE.DATA.systems[toId].name + "(燃料 −" + cost + ")");
            SE.Core.goto(SE.DATA.systems[toId].arrive);
        }
    };

    window.SE = window.SE || {};
    SE.Starmap = Starmap;
})();
