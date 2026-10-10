import React, { useState } from 'react';
import {
  ShoppingBag,
  CheckSquare,
  CheckCircle2,
  Clock,
  Plus,
  Truck,
} from 'lucide-react';
import {
  mockMerchandise,
  mockFundraiserTasks,
  MockTask,
} from '../../../data/mockClubData';

export const MerchandiseTaskModule: React.FC = () => {
  const [tasks, setTasks] = useState<MockTask[]>(mockFundraiserTasks);
  const [selectedSize, setSelectedSize] = useState<Record<string, string>>({
    'merch-hoodie': 'M',
    'merch-tee': 'L',
  });
  const [orderAlert, setOrderAlert] = useState<string | null>(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    category: 'Baking' as const,
    assignee: '',
    dueDate: 'May 2, 2026',
  });

  const handleOrder = (itemName: string, size: string, price: number) => {
    setOrderAlert(
      `Order placed for ${itemName} (Size: ${size}) at member price ₹${price}! Order #SSA-ORD-${Math.floor(
        1000 + Math.random() * 9000
      )} recorded.`
    );
  };

  const handleToggleTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const nextStatus = t.status === 'DONE' ? 'IN_PROGRESS' : 'DONE';
          return { ...t, status: nextStatus };
        }
        return t;
      })
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
      status: 'TODO',
      dueDate: newTask.dueDate,
    };
    setTasks([...tasks, task]);
    setShowTaskModal(false);
    setNewTask({ title: '', category: 'Baking', assignee: '', dueDate: 'May 2, 2026' });
  };

  const completedCount = tasks.filter((t) => t.status === 'DONE').length;
  const progressPercent = Math.round((completedCount / tasks.length) * 100);

  return (
    <div className="space-y-6">
      {/* Module Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
              Dev 3 Workstream
            </span>
            <span className="text-xs text-slate-400 font-medium">Problem Statement Scenes:</span>
            <span className="text-xs font-semibold text-slate-700">"Ordering club hoodies" & "Planning a fundraiser"</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">
            Merchandise Inventory & Fundraiser Operations
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Online apparel sizing & real-time stock control, plus collaborative volunteer task tracking replacing chaotic group chats.
          </p>
        </div>
      </div>

      {orderAlert && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs text-emerald-800 animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>{orderAlert}</span>
          </div>
          <button
            onClick={() => setOrderAlert(null)}
            className="font-bold underline hover:text-emerald-900"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* SECTION 1: MERCHANDISE STORE WITH SIZE STOCK */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-amber-600" />
              Club Apparel & Merchandise (Live Size Stock Tracker)
            </h3>
            <p className="text-xs text-slate-500">
              Members can order 24/7 with zero paper forms or missing payments.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {mockMerchandise.map((item) => {
            const currentSize = selectedSize[item.id] || item.variants[0].size;
            const currentVariant = item.variants.find((v) => v.size === currentSize);
            const isLowStock = currentVariant && currentVariant.stock <= 5;

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col sm:flex-row gap-5"
              >
                <div className="w-full sm:w-36 h-36 rounded-xl overflow-hidden bg-slate-100 shrink-0 relative">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                  {isLowStock && (
                    <span className="absolute top-2 left-2 text-[10px] font-bold text-rose-700 bg-rose-50/90 px-1.5 py-0.5 rounded border border-rose-200">
                      Only {currentVariant.stock} left!
                    </span>
                  )}
                </div>

                <div className="flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{item.name}</h4>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-base font-bold text-emerald-600">₹{item.memberPrice}</span>
                      <span className="text-xs text-slate-400 line-through">₹{item.basePrice}</span>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                        Member 20% Off
                      </span>
                    </div>
                  </div>

                  {/* Size Selector with remaining stock indicators */}
                  <div>
                    <span className="text-[11px] font-semibold text-slate-600 block mb-1.5">
                      Select Size & Check Available Stock:
                    </span>
                    <div className="flex items-center gap-2">
                      {item.variants.map((v) => {
                        const isSelected = currentSize === v.size;
                        return (
                          <button
                            key={v.size}
                            onClick={() => setSelectedSize({ ...selectedSize, [item.id]: v.size })}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                              isSelected
                                ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                                : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            <span>{v.size}</span>
                            <span className="text-[10px] opacity-75 ml-1 font-normal">({v.stock})</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <button
                    onClick={() => handleOrder(item.name, currentSize, item.memberPrice)}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold py-2 px-3 rounded-xl transition-colors shadow-xs flex items-center justify-center gap-1.5"
                  >
                    <Truck className="h-3.5 w-3.5" />
                    <span>Order Online (Size {currentSize} • ₹{item.memberPrice})</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: FUNDRAISER VOLUNTEER TASK BOARD */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <CheckSquare className="h-5 w-5 text-indigo-600" />
                Spring Bake Sale Volunteer Task Board
              </h3>
              <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                Fundraiser Ops
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Everyone sees who is baking, buying supplies, and staffing tables without losing track in WhatsApp chats.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <span className="text-xs font-bold text-slate-800">
                {completedCount} of {tasks.length} Done ({progressPercent}%)
              </span>
              <div className="w-28 h-2 bg-slate-100 rounded-full overflow-hidden mt-1">
                <div
                  className="h-full bg-indigo-600 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            <button
              onClick={() => setShowTaskModal(true)}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Task</span>
            </button>
          </div>
        </div>

        {/* Modal for adding task */}
        {showTaskModal && (
          <form
            onSubmit={handleAddTask}
            className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 text-xs"
          >
            <div className="font-bold text-slate-800">New Volunteer Task Assignment</div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="Task description (e.g. Bake brownies)"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                className="px-3 py-2 rounded-lg border border-slate-200 bg-white"
                required
              />
              <select
                value={newTask.category}
                onChange={(e) => setNewTask({ ...newTask, category: e.target.value as any })}
                className="px-3 py-2 rounded-lg border border-slate-200 bg-white"
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
                className="px-3 py-2 rounded-lg border border-slate-200 bg-white"
                required
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowTaskModal(false)}
                className="px-3 py-1 rounded-lg text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1 rounded-lg bg-indigo-600 text-white font-semibold"
              >
                Assign Task
              </button>
            </div>
          </form>
        )}

        {/* Task Cards List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {tasks.map((task) => {
            const isDone = task.status === 'DONE';
            const categoryColors: Record<string, string> = {
              Baking: 'bg-amber-50 text-amber-700 border-amber-200',
              Supplies: 'bg-blue-50 text-blue-700 border-blue-200',
              'Table Shift': 'bg-emerald-50 text-emerald-700 border-emerald-200',
              Promotion: 'bg-purple-50 text-purple-700 border-purple-200',
            };

            return (
              <div
                key={task.id}
                className={`p-4 rounded-xl border transition-all flex flex-col justify-between space-y-3 ${
                  isDone
                    ? 'bg-slate-50/70 border-slate-200 text-slate-500'
                    : 'bg-white border-slate-200 shadow-xs hover:border-indigo-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                        categoryColors[task.category] || 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {task.category}
                    </span>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {task.dueDate}
                    </span>
                  </div>

                  <p className={`text-xs font-bold ${isDone ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                    {task.title}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                  <div className="flex items-center gap-1.5">
                    <div className="h-6 w-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-[10px]">
                      {task.assignee.substring(0, 2)}
                    </div>
                    <span className="font-medium text-slate-700">{task.assignee}</span>
                  </div>

                  <button
                    onClick={() => handleToggleTask(task.id)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                      isDone
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-100 hover:bg-emerald-600 hover:text-white text-slate-700'
                    }`}
                  >
                    {isDone ? 'Completed' : 'Mark Done'}
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
