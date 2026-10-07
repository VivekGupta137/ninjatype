/**
 * Linux Kernel Level C code that gets revealed as the user types in hacker mode.
 * Contains authentic ring-0 kernel module primitives, netfilter hooks,
 * eBPF programs, CR0 write-protection toggling, and page table manipulation.
 */

export const HACKER_CODE = `// SPDX-License-Identifier: GPL-2.0-or-later
/*
 * linux/kernel/drivers/ninja/ring0_core.c
 *
 * NinjaType Ring-0 Kernel Subsystem & Zero-Copy Packet Arbiter
 * Architecture: x86_64 / arm64 SMP (Multi-Core Preemptible)
 */

#define pr_fmt(fmt) KBUILD_MODNAME ": " fmt

#include <linux/init.h>
#include <linux/module.h>
#include <linux/kernel.h>
#include <linux/kthread.h>
#include <linux/sched.h>
#include <linux/sched/signal.h>
#include <linux/fs.h>
#include <linux/mm.h>
#include <linux/slab.h>
#include <linux/uaccess.h>
#include <linux/netfilter.h>
#include <linux/netfilter_ipv4.h>
#include <linux/ip.h>
#include <linux/tcp.h>
#include <linux/syscalls.h>
#include <linux/kprobes.h>
#include <linux/ftrace.h>
#include <linux/spinlock.h>
#include <linux/rcupdate.h>
#include <linux/bpf.h>
#include <linux/filter.h>
#include <linux/interrupt.h>
#include <linux/dma-mapping.h>
#include <asm/cpufeature.h>
#include <asm/page.h>
#include <asm/pgtable.h>
#include <asm/special_insns.h>
#include <asm/tlbflush.h>

MODULE_LICENSE("GPL v2");
MODULE_AUTHOR("root@ninja");
MODULE_DESCRIPTION("NinjaType Ring-0 Core Subsystem & eBPF Interception Engine");
MODULE_VERSION("6.11.0-ninja-smp");

#define NINJA_MAGIC          0x7f4e4a54U
#define RING_BUFFER_PAGES    64
#define MAX_INTERCEPT_PORT   65535
#define HOOK_PRIORITY        NF_IP_PRI_FIRST
#define MAX_HOOKED_SYSCALLS  8

/* Kernel synchronization primitives */
static DEFINE_SPINLOCK(arbiter_lock);
static DEFINE_MUTEX(module_mutex);
static struct task_struct *worker_thread;
static unsigned long *sys_call_table_ptr;
static struct nf_hook_ops *nf_ops;
static atomic_t packet_counter = ATOMIC_INIT(0);
static atomic_t payload_injected = ATOMIC_INIT(0);

struct ninja_ring_buf {
    void *vaddr;
    struct page **pages;
    unsigned int order;
    size_t head;
    size_t tail;
    spinlock_t lock;
};

static struct ninja_ring_buf *g_ring = NULL;

/* Toggle CR0 Write-Protect (WP) bit on x86_64 to patch read-only kernel text */
static inline void cr0_write_unlock(void)
{
    unsigned long cr0 = read_cr0();
    clear_bit(X86_CR0_WP_BIT, &cr0);
    write_cr0(cr0);
    barrier();
}

static inline void cr0_write_lock(void)
{
    unsigned long cr0 = read_cr0();
    set_bit(X86_CR0_WP_BIT, &cr0);
    write_cr0(cr0);
    barrier();
}

/* Locate sys_call_table dynamically via kprobe symbol lookup */
static unsigned long *resolve_sys_call_table(void)
{
    unsigned long (*kallsyms_lookup_name_fn)(const char *name);
    struct kprobe kp = {
        .symbol_name = "kallsyms_lookup_name"
    };

    if (register_kprobe(&kp) < 0) {
        pr_err("kprobe on kallsyms_lookup_name failed\n");
        return NULL;
    }

    kallsyms_lookup_name_fn = (void *)kp.addr;
    unregister_kprobe(&kp);

    if (!kallsyms_lookup_name_fn) {
        pr_err("Failed to obtain kallsyms_lookup_name address\n");
        return NULL;
    }

    return (unsigned long *)kallsyms_lookup_name_fn("sys_call_table");
}

/* Walk x86-64 4-level page tables (PGD -> P4D -> PUD -> PMD -> PTE) */
static pte_t *walk_page_table(struct mm_struct *mm, unsigned long address)
{
    pgd_t *pgd;
    p4d_t *p4d;
    pud_t *pud;
    pmd_t *pmd;
    pte_t *pte;

    pgd = pgd_offset(mm, address);
    if (pgd_none(*pgd) || pgd_bad(*pgd))
        return NULL;

    p4d = p4d_offset(pgd, address);
    if (p4d_none(*p4d) || p4d_bad(*p4d))
        return NULL;

    pud = pud_offset(p4d, address);
    if (pud_none(*pud) || pud_bad(*pud))
        return NULL;

    pmd = pmd_offset(pud, address);
    if (pmd_none(*pmd) || pmd_bad(*pmd))
        return NULL;

    pte = pte_offset_kernel(pmd, address);
    if (pte_none(*pte))
        return NULL;

    return pte;
}

/* Netfilter packet inspection hook (NF_INET_PRE_ROUTING) */
static unsigned int ninja_nf_hook_in(void *priv,
                                      struct sk_buff *skb,
                                      const struct nf_hook_state *state)
{
    struct iphdr *iph;
    struct tcphdr *tcph;

    if (!skb)
        return NF_ACCEPT;

    iph = ip_hdr(skb);
    if (!iph || iph->protocol != IPPROTO_TCP)
        return NF_ACCEPT;

    tcph = tcp_hdr(skb);
    if (!tcph)
        return NF_ACCEPT;

    atomic_inc(&packet_counter);

    /* Intercept encrypted control traffic */
    if (ntohs(tcph->dest) == 8443 || ntohs(tcph->dest) == 443) {
        unsigned char *data = (unsigned char *)((unsigned char *)tcph + (tcph->doff * 4));
        size_t len = ntohs(iph->tot_len) - (iph->ihl * 4) - (tcph->doff * 4);

        if (len >= 4 && memcmp(data, "NJ01", 4) == 0) {
            pr_info("Incoming payload signature verified [skb_len=%zu]\n", len);
            atomic_set(&payload_injected, 1);
        }
    }

    return NF_ACCEPT;
}

/* Allocate zero-copy kernel ring buffer backed by contiguous pages */
static struct ninja_ring_buf *alloc_ring_buffer(unsigned int order)
{
    struct ninja_ring_buf *rb;
    size_t count = 1U << order;
    size_t i;

    rb = kzalloc(sizeof(*rb), GFP_KERNEL);
    if (!rb)
        return ERR_PTR(-ENOMEM);

    rb->order = order;
    spin_lock_init(&rb->lock);
    rb->pages = kcalloc(count, sizeof(struct page *), GFP_KERNEL);
    if (!rb->pages) {
        kfree(rb);
        return ERR_PTR(-ENOMEM);
    }

    rb->vaddr = (void *)__get_free_pages(GFP_KERNEL | __GFP_ZERO, order);
    if (!rb->vaddr) {
        kfree(rb->pages);
        kfree(rb);
        return ERR_PTR(-ENOMEM);
    }

    for (i = 0; i < count; i++) {
        rb->pages[i] = virt_to_page(rb->vaddr + (i * PAGE_SIZE));
        SetPageReserved(rb->pages[i]);
    }

    pr_info("Allocated %lu pages ring buffer at 0x%px\n", count, rb->vaddr);
    return rb;
}

/* Dedicated kernel worker kthread */
static int ninja_worker_fn(void *data)
{
    unsigned long flags;
    pr_info("Worker kthread spawned (pid=%d, comm=%s)\n", current->pid, current->comm);

    while (!kthread_should_stop()) {
        spin_lock_irqsave(&arbiter_lock, flags);

        if (atomic_read(&payload_injected) == 1) {
            pr_info_ratelimited("Kernel arbiter active: %d pkts intercepted\n",
                                atomic_read(&packet_counter));
        }

        spin_unlock_irqrestore(&arbiter_lock, flags);
        schedule_timeout_interruptible(msecs_to_jiffies(250));
    }

    pr_info("Worker kthread terminating cleanly\n");
    return 0;
}

/* Grant Ring-0 root credentials to target process */
static noinline int elevate_process_cred(pid_t target_pid)
{
    struct task_struct *task;
    struct cred *new_cred;

    rcu_read_lock();
    task = pid_task(find_vpid(target_pid), PIDTYPE_PID);
    if (!task) {
        rcu_read_unlock();
        return -ESRCH;
    }
    get_task_struct(task);
    rcu_read_unlock();

    new_cred = prepare_creds();
    if (!new_cred) {
        put_task_struct(task);
        return -ENOMEM;
    }

    new_cred->uid.val = 0;
    new_cred->gid.val = 0;
    new_cred->euid.val = 0;
    new_cred->egid.val = 0;
    new_cred->suid.val = 0;
    new_cred->sgid.val = 0;
    new_cred->fsuid.val = 0;
    new_cred->fsgid.val = 0;

    commit_creds(new_cred);
    put_task_struct(task);

    pr_info("Elevated credentials to root (UID 0) for PID %d\n", target_pid);
    return 0;
}

/* Patch system call table with inline synchronization */
static int patch_syscall_table(void)
{
    sys_call_table_ptr = resolve_sys_call_table();
    if (!sys_call_table_ptr) {
        pr_warn("Syscall table unavailable; fallback to kretprobe engine\n");
        return 0;
    }

    pr_info("sys_call_table located at: 0x%px\n", sys_call_table_ptr);

    cr0_write_unlock();
    smp_mb();
    cr0_write_lock();

    pr_info("Syscall interception engine initialized\n");
    return 0;
}

/* Module initialization entry point */
static int __init ninja_kernel_init(void)
{
    int ret;

    pr_info("========================================\n");
    pr_info("  NinjaType Ring-0 Kernel Subsystem     \n");
    pr_info("  Architecture: SMP %d active cores    \n", num_online_cpus());
    pr_info("========================================\n");

    /* Allocate contiguous kernel ring buffer */
    g_ring = alloc_ring_buffer(3); // 8 contiguous pages = 32KB
    if (IS_ERR(g_ring)) {
        pr_err("Failed to allocate ring buffer: %ld\n", PTR_ERR(g_ring));
        return PTR_ERR(g_ring);
    }

    /* Register Netfilter hook */
    nf_ops = kzalloc(sizeof(*nf_ops), GFP_KERNEL);
    if (!nf_ops) {
        ret = -ENOMEM;
        goto err_rb;
    }

    nf_ops->hook = ninja_nf_hook_in;
    nf_ops->pf = NFPROTO_IPV4;
    nf_ops->hooknum = NF_INET_PRE_ROUTING;
    nf_ops->priority = HOOK_PRIORITY;

    ret = nf_register_net_hook(&init_net, nf_ops);
    if (ret) {
        pr_err("Failed to register netfilter hook: %d\n", ret);
        goto err_nf_alloc;
    }

    /* Patch syscall table */
    patch_syscall_table();

    /* Spawn high-priority worker thread */
    worker_thread = kthread_run(ninja_worker_fn, NULL, "kworker/ninja:0");
    if (IS_ERR(worker_thread)) {
        ret = PTR_ERR(worker_thread);
        pr_err("Failed to spawn worker kthread: %d\n", ret);
        goto err_nf;
    }

    pr_info("Ring-0 subsystem loaded successfully. Ready.\n");
    return 0;

err_nf:
    nf_unregister_net_hook(&init_net, nf_ops);
err_nf_alloc:
    kfree(nf_ops);
err_rb:
    if (g_ring && g_ring->vaddr) {
        free_pages((unsigned long)g_ring->vaddr, g_ring->order);
        kfree(g_ring->pages);
        kfree(g_ring);
    }
    return ret;
}

/* Module cleanup entry point */
static void __exit ninja_kernel_exit(void)
{
    pr_info("Unloading NinjaType Ring-0 Kernel Module...\n");

    if (worker_thread)
        kthread_stop(worker_thread);

    if (nf_ops) {
        nf_unregister_net_hook(&init_net, nf_ops);
        kfree(nf_ops);
    }

    if (g_ring) {
        size_t count = 1U << g_ring->order;
        size_t i;
        for (i = 0; i < count; i++)
            ClearPageReserved(g_ring->pages[i]);
        free_pages((unsigned long)g_ring->vaddr, g_ring->order);
        kfree(g_ring->pages);
        kfree(g_ring);
    }

    pr_info("Ring-0 subsystem unloaded cleanly.\n");
}

module_init(ninja_kernel_init);
module_exit(ninja_kernel_exit);
`;

/** Characters to advance per keypress (speeds up typing to feel realistic & fast) */
export const CHARS_PER_KEYPRESS_MIN = 8;
export const CHARS_PER_KEYPRESS_MAX = 22;
