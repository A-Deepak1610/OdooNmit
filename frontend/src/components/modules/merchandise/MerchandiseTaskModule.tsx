import React, { useState } from "react";
import {
  ShoppingBag,
  CheckSquare,
  CheckCircle2,
  Clock,
  Plus,
  Truck,
} from "lucide-react";
import {
  mockMerchandise,
  mockFundraiserTasks,
  MockTask,
} from "../../../data/mockClubData";

export const MerchandiseTaskModule: React.FC = () => {
  const [tasks, setTasks] = useState<MockTask[]>(mockFundraiserTasks);
  const [selectedSize, setSelectedSize] = useState<Record<string, string>>({
    "merch-hoodie": "M",
    "merch-tee": "L",
  });
  const [orderAlert, setOrderAlert] = useState<string | null>(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    category: "Baking" as const,
    assignee: "",
    dueDate: "May 2, 2026",
  });

  const handleOrder = (itemName: string, size: string, price: number) => {
    setOrderAlert(
      `Order placed for ${itemName} (Size: ${size}) at member price ₹${price}! Order #SSA-ORD-${Math.floor(
        1000 + Math.random() * 9000,
      )} recorded.`,
    );
  };

  const handleToggleTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const nextStatus = t.status === "DONE" ? "IN_PROGRESS" : "DONE";
          return { ...t, status: nextStatus };
        }
        return t;
      }),
    );
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title || !newTask.assignee) return;

    const task: MockTask = {
      id: `tsk-${Date.now()}`,
      title: newTask.title,
      category: newTask.category,
      assignee: newTask.assignee,
      status: "TODO",
      dueDate: newTask.dueDate,
    };
    setTasks([...tasks, task]);
    setShowTaskModal(false);
    setNewTask({
      title: "",
      category: "Baking",
      assignee: "",
      dueDate: "May 2, 2026",
    });
  };

  const completedCount = tasks.filter((t) => t.status === "DONE").length;
  const progressPercent = Math.round((completedCount / tasks.length) * 100);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* ── 1. MODULE HEADER ───────────────────────────────── */}
      <div
        style={{
          background: "white",
          borderRadius: "12px",
          border: "1px solid #e2e8f0",
          padding: "20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
            <span
              style={{
                fontSize: "11px",
                fontWeight: 600,
                color: "#b45309",
                background: "#fef3c7",
                padding: "2px 8px",
                borderRadius: "4px",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Dev 3 Workstream
            </span>
            <span style={{ fontSize: "12px", color: "#64748b" }}>
              Problem Scenes: "Ordering club hoodies" & "Planning a fundraiser"
            </span>
          </div>
          <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#1e293b", margin: "0 0 4px 0" }}>
            Merchandise Inventory & Fundraiser Operations
          </h2>
          <p style={{ fontSize: "13px", color: "#64748b", margin: 0 }}>
            Apparel sizing & real-time stock control, plus collaborative volunteer task tracking replacing chaotic group chats.
          </p>
        </div>
      </div>

      {orderAlert && (
        <div
          style={{
            padding: "14px 18px",
            borderRadius: "8px",
            background: "#dcfce7",
            border: "1px solid #bbf7d0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: "13px",
            color: "#15803d",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <CheckCircle2 size={16} color="#15803d" />
            <span>{orderAlert}</span>
          </div>
          <button
            onClick={() => setOrderAlert(null)}
            style={{
              background: "none",
              border: "none",
              color: "#15803d",
              fontWeight: 600,
              cursor: "pointer",
              fontSize: "12px",
            }}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ── 2. APPAREL & MERCHANDISE SECTION ───────────────── */}
      <div>
        <div style={{ marginBottom: "14px" }}>
          <h3
            style={{
              fontSize: "15px",
              fontWeight: 600,
              color: "#1e293b",
              margin: 0,
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <ShoppingBag size={18} color="#1e3a8a" />
            Club Apparel & Merchandise (Live Size Stock Tracker)
          </h3>
          <p style={{ fontSize: "12px", color: "#64748b", margin: "2px 0 0" }}>
            Direct online orders 24/7 with instant size tracking and zero paper order forms.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))", gap: "16px" }}>
          {mockMerchandise.map((item) => {
            const currentSize = selectedSize[item.id] || item.variants[0].size;
            const currentVariant = item.variants.find((v) => v.size === currentSize);
            const isLowStock = currentVariant && currentVariant.stock <= 5;

            return (
              <div
                key={item.id}
                style={{
                  background: "white",
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                  padding: "20px",
                  display: "flex",
                  gap: "18px",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    width: "130px",
                    height: "130px",
                    borderRadius: "8px",
                    overflow: "hidden",
                    background: "#f1f5f9",
                    flexShrink: 0,
                    position: "relative",
                  }}
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                  {isLowStock && (
                    <span
                      style={{
                        position: "absolute",
                        top: "6px",
                        left: "6px",
                        fontSize: "10px",
                        fontWeight: 600,
                        background: "#fef2f2",
                        color: "#dc2626",
                        border: "1px solid #fecaca",
                        padding: "2px 6px",
                        borderRadius: "4px",
                      }}
                    >
                      Only {currentVariant.stock} left!
                    </span>
                  )}
                </div>

                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "10px" }}>
                  <div>
                    <h4 style={{ fontSize: "15px", fontWeight: 600, color: "#1e293b", margin: "0 0 4px 0" }}>
                      {item.name}
                    </h4>
                    <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
                      <span style={{ fontSize: "16px", fontWeight: 700, color: "#15803d" }}>
                        ₹{item.memberPrice}
                      </span>
                      <span style={{ fontSize: "12px", color: "#94a3b8", textDecoration: "line-through" }}>
                        ₹{item.basePrice}
                      </span>
                      <span
                        style={{
                          background: "#dcfce7",
                          color: "#15803d",
                          fontSize: "11px",
                          fontWeight: 600,
                          padding: "2px 6px",
                          borderRadius: "4px",
                        }}
                      >
                        Member 20% Off
                      </span>
                    </div>
                  </div>

                  {/* Size Selector */}
                  <div>
                    <span style={{ fontSize: "11px", fontWeight: 600, color: "#64748b", display: "block", marginBottom: "6px" }}>
                      Select Size & Stock:
                    </span>
                    <div style={{ display: "flex", gap: "6px" }}>
                      {item.variants.map((v) => {
                        const isSelected = currentSize === v.size;
                        return (
                          <button
                            key={v.size}
                            onClick={() => setSelectedSize({ ...selectedSize, [item.id]: v.size })}
                            style={{
                              padding: "4px 10px",
                              borderRadius: "6px",
                              fontSize: "12px",
                              fontWeight: 600,
                              cursor: "pointer",
                              border: isSelected ? "1px solid #1e3a8a" : "1px solid #e2e8f0",
                              background: isSelected ? "#1e3a8a" : "#f8fafc",
                              color: isSelected ? "white" : "#475569",
                              transition: "all 0.2s",
                            }}
                          >
                            <span>{v.size}</span>
                            <span style={{ fontSize: "10px", opacity: 0.8, marginLeft: "4px" }}>({v.stock})</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <button
                    onClick={() => handleOrder(item.name, currentSize, item.memberPrice)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      padding: "8px 14px",
                      background: "#1e3a8a",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      fontSize: "12px",
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                  >
                    <Truck size={14} />
                    Order Online (Size {currentSize} • ₹{item.memberPrice})
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 3. FUNDRAISER VOLUNTEER TASK BOARD ──────────────── */}
      <div
        style={{
          background: "white",
          borderRadius: "12px",
          border: "1px solid #e2e8f0",
          padding: "20px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid #e2e8f0",
            paddingBottom: "14px",
            marginBottom: "16px",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <h3 style={{ fontSize: "15px", fontWeight: 600, color: "#1e293b", margin: 0, display: "flex", alignItems: "center", gap: "6px" }}>
                <CheckSquare size={18} color="#1e3a8a" />
                Spring Bake Sale Volunteer Task Board
              </h3>
              <span
                style={{
                  background: "#eff6ff",
                  color: "#1e3a8a",
                  padding: "2px 8px",
                  borderRadius: "4px",
                  fontSize: "11px",
                  fontWeight: 600,
                }}
              >
                Fundraiser Ops
              </span>
            </div>
            <p style={{ fontSize: "12px", color: "#64748b", margin: "2px 0 0" }}>
              Track baking, supply purchasing, and table shift duties with live volunteer assignment transparency.
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "12px", fontWeight: 600, color: "#1e293b" }}>
                {completedCount} of {tasks.length} Completed ({progressPercent}%)
              </div>
              <div
                style={{
                  width: "120px",
                  height: "6px",
                  background: "#f1f5f9",
                  borderRadius: "3px",
                  overflow: "hidden",
                  marginTop: "4px",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${progressPercent}%`,
                    background: "#16a34a",
                    borderRadius: "3px",
                    transition: "width 0.3s ease",
                  }}
                />
              </div>
            </div>

            <button
              onClick={() => setShowTaskModal(true)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 14px",
                background: "#1e3a8a",
                color: "white",
                border: "none",
                borderRadius: "6px",
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              <Plus size={14} />
              Add Task
            </button>
          </div>
        </div>

        {/* Modal / Form for adding task */}
        {showTaskModal && (
          <form
            onSubmit={handleAddTask}
            style={{
              padding: "16px",
              borderRadius: "8px",
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              marginBottom: "16px",
            }}
          >
            <div style={{ fontSize: "13px", fontWeight: 600, color: "#1e293b", marginBottom: "10px" }}>
              New Volunteer Task Assignment
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "10px", marginBottom: "12px" }}>
              <input
                type="text"
                placeholder="Task description (e.g. Bake brownies)"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                style={taskInputStyle}
                required
              />
              <select
                value={newTask.category}
                onChange={(e) => setNewTask({ ...newTask, category: e.target.value as any })}
                style={taskSelectStyle}
              >
                <option value="Baking">Baking Duty</option>
                <option value="Supplies">Supplies & Ingredients</option>
                <option value="Table Shift">Table Shift & Cashier</option>
                <option value="Promotion">Promotion & Posters</option>
              </select>
              <input
                type="text"
                placeholder="Assignee student name"
                value={newTask.assignee}
                onChange={(e) => setNewTask({ ...newTask, assignee: e.target.value })}
                style={taskInputStyle}
                required
              />
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
              <button
                type="button"
                onClick={() => setShowTaskModal(false)}
                style={{
                  padding: "6px 12px",
                  borderRadius: "6px",
                  border: "1px solid #e2e8f0",
                  background: "white",
                  color: "#64748b",
                  fontSize: "12px",
                  fontWeight: 500,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{
                  padding: "6px 14px",
                  borderRadius: "6px",
                  background: "#1e3a8a",
                  color: "white",
                  border: "none",
                  fontSize: "12px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Assign Task
              </button>
            </div>
          </form>
        )}

        {/* Task Cards Grid (3-col) */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "14px" }}>
          {tasks.map((task) => {
            const isDone = task.status === "DONE";
            const categoryBadgeStyle: Record<string, { bg: string; color: string }> = {
              Baking: { bg: "#fef3c7", color: "#b45309" },
              Supplies: { bg: "#eff6ff", color: "#1e3a8a" },
              "Table Shift": { bg: "#dcfce7", color: "#15803d" },
              Promotion: { bg: "#f3e8ff", color: "#7c3aed" },
            };
            const badge = categoryBadgeStyle[task.category] || { bg: "#f1f5f9", color: "#475569" };

            return (
              <div
                key={task.id}
                style={{
                  padding: "16px",
                  borderRadius: "10px",
                  border: "1px solid #e2e8f0",
                  background: isDone ? "#f8fafc" : "white",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: "12px",
                  transition: "all 0.2s",
                }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <span
                      style={{
                        fontSize: "10px",
                        fontWeight: 600,
                        padding: "2px 6px",
                        borderRadius: "4px",
                        background: badge.bg,
                        color: badge.color,
                      }}
                    >
                      {task.category}
                    </span>
                    <span style={{ fontSize: "11px", color: "#94a3b8", display: "flex", alignItems: "center", gap: "4px" }}>
                      <Clock size={12} />
                      {task.dueDate}
                    </span>
                  </div>

                  <div
                    style={{
                      fontSize: "13px",
                      fontWeight: 600,
                      color: isDone ? "#94a3b8" : "#1e293b",
                      textDecoration: isDone ? "line-through" : "none",
                    }}
                  >
                    {task.title}
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderTop: "1px solid #f1f5f9",
                    paddingTop: "10px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <img
                      src={`https://api.dicebear.com/9.x/thumbs/svg?seed=${encodeURIComponent(task.assignee)}&backgroundColor=b6e3f4`}
                      alt={task.assignee}
                      style={{ width: "24px", height: "24px", borderRadius: "50%" }}
                    />
                    <span style={{ fontSize: "12px", fontWeight: 500, color: "#475569" }}>
                      {task.assignee}
                    </span>
                  </div>

                  <button
                    onClick={() => handleToggleTask(task.id)}
                    style={{
                      padding: "4px 8px",
                      borderRadius: "4px",
                      fontSize: "11px",
                      fontWeight: 600,
                      cursor: "pointer",
                      border: isDone ? "1px solid #bbf7d0" : "1px solid #e2e8f0",
                      background: isDone ? "#dcfce7" : "#f8fafc",
                      color: isDone ? "#15803d" : "#475569",
                      transition: "all 0.2s",
                    }}
                  >
                    {isDone ? "Done ✓" : "Mark Done"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

/* ─── MODULE-SCOPE STYLES ───────────────────────────────── */
const taskInputStyle: React.CSSProperties = {
  height: "36px",
  padding: "0 10px",
  border: "1px solid #e2e8f0",
  borderRadius: "6px",
  background: "white",
  fontSize: "12px",
  outline: "none",
};

const taskSelectStyle: React.CSSProperties = {
  height: "36px",
  padding: "0 10px",
  border: "1px solid #e2e8f0",
  borderRadius: "6px",
  background: "white",
  fontSize: "12px",
  outline: "none",
  cursor: "pointer",
};

